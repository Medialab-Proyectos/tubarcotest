-- TuBarco Inteligente — esquema del MVP
-- Cubre lo que la propuesta marca como P0 (perfiles, temas, lugares, guardar,
-- seguir historias) más el contador de clics por noticia que se pidió aparte.
--
-- WordPress sigue siendo la fuente editorial: aquí NO se replica el cuerpo de
-- las notas todavía. Basta con la referencia (wp_post_id + slug) para colgar
-- guardados, clics y relaciones. La réplica completa con embeddings entra en
-- la fase siguiente.

-- ---------------------------------------------------------------- perfiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  -- Iniciales para el avatar del header ("Mi TuBarco").
  locale text not null default 'es-CO',
  timezone text not null default 'America/Bogota',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Crear el perfil en cuanto nace el usuario, para no depender del frontend.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------- taxonomía canónica
-- La propuesta insiste en esto: el menú dice "Mundo" y la portada
-- "Internacional". Se guarda un concepto único con alias visibles, para que las
-- estadísticas y las recomendaciones no se partan en dos.
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  canonical_name text not null,
  display_name text not null,
  wp_term_id integer,
  created_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  place_type text not null check (place_type in ('pais', 'departamento', 'ciudad')),
  parent_id uuid references public.places (id) on delete set null,
  wp_term_id integer,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------ preferencias
create table if not exists public.user_topic_preferences (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id uuid not null references public.topics (id) on delete cascade,
  weight real not null default 1,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists public.user_place_preferences (
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  weight real not null default 1,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

-- ---------------------------------------------------------------- guardados
create table if not exists public.saved_articles (
  user_id uuid not null references auth.users (id) on delete cascade,
  wp_post_id integer not null,
  slug text not null,
  title text not null,
  image_url text,
  category text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, wp_post_id)
);

create index if not exists saved_articles_user_idx
  on public.saved_articles (user_id, created_at desc);

-- --------------------------------------------------------------- historias
-- Una historia agrupa varias notas sobre un mismo acontecimiento. En el MVP se
-- crean a mano o por el slug de la nota semilla; la detección automática llega
-- con la fase de IA.
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  status text not null default 'open' check (status in ('open', 'closed')),
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now()
);

create table if not exists public.followed_stories (
  user_id uuid not null references auth.users (id) on delete cascade,
  story_id uuid not null references public.stories (id) on delete cascade,
  frequency text not null default 'importantes'
    check (frequency in ('importantes', 'todas', 'resumen')),
  channels text[] not null default array['in_app'],
  created_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

-- ------------------------------------------------------- clics por noticia
-- Pedido expreso: el número tiene que ser visible para todo el mundo, no solo
-- analítica interna. Por eso vive en la base y no en PostHog.
--
-- `article_views` es el acumulado que lee cualquiera; `article_view_events`
-- guarda el detalle para poder deduplicar por sesión y detectar abuso.
create table if not exists public.article_views (
  wp_post_id integer primary key,
  slug text not null,
  total integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.article_view_events (
  id bigserial primary key,
  wp_post_id integer not null,
  -- Identificador anónimo de navegador: permite no contar diez veces al mismo
  -- lector sin necesidad de saber quién es.
  anonymous_id uuid not null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Día de la visita, fijado en UTC y guardado en la fila.
-- No se puede indexar `created_at::date` directamente: ese cast depende de la
-- zona horaria de la sesión, así que Postgres lo considera variable y rechaza
-- el índice (42P17). Anclarlo a UTC lo vuelve constante.
alter table public.article_view_events
  add column if not exists view_day date
  generated always as (((created_at at time zone 'UTC')::date)) stored;

-- Un lector suma una sola vez por nota y día.
create unique index if not exists article_view_events_unicos
  on public.article_view_events (wp_post_id, anonymous_id, view_day);

create index if not exists article_views_total_idx
  on public.article_views (total desc);

-- Suma un clic de forma atómica y devuelve el total ya actualizado.
create or replace function public.registrar_visita(
  p_wp_post_id integer,
  p_slug text,
  p_anonymous_id uuid
)
returns integer
language plpgsql
security definer set search_path = ''
as $$
declare
  v_nuevo boolean := false;
  v_total integer;
begin
  begin
    insert into public.article_view_events (wp_post_id, anonymous_id, user_id)
    values (p_wp_post_id, p_anonymous_id, auth.uid());
    v_nuevo := true;
  exception when unique_violation then
    -- Ya contaba hoy: se devuelve el total sin sumar.
    v_nuevo := false;
  end;

  if v_nuevo then
    -- Alias `av`: dentro de ON CONFLICT la tabla se referencia por nombre o
    -- alias, y con search_path vacío el alias evita cualquier ambigüedad.
    insert into public.article_views as av (wp_post_id, slug, total, updated_at)
    values (p_wp_post_id, p_slug, 1, now())
    on conflict (wp_post_id) do update
      set total = av.total + 1,
          updated_at = now();
  end if;

  select total into v_total
  from public.article_views
  where wp_post_id = p_wp_post_id;

  return coalesce(v_total, 0);
end;
$$;

-- ================================================================== RLS
-- Cada quien ve y toca solo lo suyo. Los contadores y la taxonomía son de
-- lectura pública porque se pintan para cualquier visitante.

alter table public.profiles                enable row level security;
alter table public.user_topic_preferences  enable row level security;
alter table public.user_place_preferences  enable row level security;
alter table public.saved_articles          enable row level security;
alter table public.followed_stories        enable row level security;
alter table public.article_view_events     enable row level security;
alter table public.article_views           enable row level security;
alter table public.topics                  enable row level security;
alter table public.places                  enable row level security;
alter table public.stories                 enable row level security;

-- Perfil propio
drop policy if exists "perfil propio" on public.profiles;
create policy "perfil propio" on public.profiles
  for all using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Preferencias, guardados y seguimientos: solo el dueño
drop policy if exists "temas propios" on public.user_topic_preferences;
create policy "temas propios" on public.user_topic_preferences
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "lugares propios" on public.user_place_preferences;
create policy "lugares propios" on public.user_place_preferences
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "guardados propios" on public.saved_articles;
create policy "guardados propios" on public.saved_articles
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "seguimientos propios" on public.followed_stories;
create policy "seguimientos propios" on public.followed_stories
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Catálogos e indicadores: lectura para todos, escritura solo desde el servidor
drop policy if exists "temas visibles" on public.topics;
create policy "temas visibles" on public.topics for select using (true);

drop policy if exists "lugares visibles" on public.places;
create policy "lugares visibles" on public.places for select using (true);

drop policy if exists "historias visibles" on public.stories;
create policy "historias visibles" on public.stories for select using (true);

drop policy if exists "contadores visibles" on public.article_views;
create policy "contadores visibles" on public.article_views for select using (true);

-- `article_view_events` queda sin política de lectura a propósito: nadie debe
-- poder reconstruir el recorrido de otra persona. Se escribe solo por la
-- función `registrar_visita`, que corre como definer.
