-- ============================================================================
-- Capa de personalización: temas, lugares, ritmo de alertas e historias.
--
-- Las tablas ya nacieron en 0001 pero estaban vacías y sin pantalla. Aquí se
-- siembra la taxonomía del documento (págs. 9-10), se añade el ritmo de avisos
-- y se abre el seguimiento de historias.
--
-- Regla del documento que condiciona el modelo: la personalización pregunta
-- primero por TEMAS y después, opcional, por LUGARES. Y "Entretenimiento", que
-- en el menú del sitio cuelga de "Más regiones", aquí es un tema — la posición
-- visual del menú no manda sobre la taxonomía.
-- ============================================================================

-- ------------------------------------------------------------------- temas
-- Cómo se piden las noticias de cada tema a WordPress: unos tienen categoría
-- propia y otros solo se resuelven por búsqueda (mismo criterio que SECTIONS
-- en lib/wp.ts).
alter table public.topics
  add column if not exists wp_category_id integer,
  add column if not exists search_term text,
  add column if not exists sort_order smallint not null default 0;

insert into public.topics (slug, canonical_name, display_name, wp_category_id, search_term, sort_order)
values
  ('geopolitica',     'geopolitica',     'Geopolítica',     null,   'geopolítica',    1),
  ('ciencia',         'ciencia',         'Ciencia',         null,   'ciencia',        2),
  ('economia',        'economia',        'Economía',        null,   'economía',       3),
  ('mundo',           'mundo',           'Mundo',           35616,  null,             4),
  ('migracion',       'migracion',       'Migración',       null,   'migración',      5),
  ('especiales',      'especiales',      'Especiales',      227391, null,             6),
  ('deportes',        'deportes',        'Deportes',        null,   'deportes',       7),
  ('tecnologia',      'tecnologia',      'Tecnología',      null,   'tecnología',     8),
  ('entretenimiento', 'entretenimiento', 'Entretenimiento', 206621, null,             9)
on conflict (slug) do update
  set display_name   = excluded.display_name,
      wp_category_id = excluded.wp_category_id,
      search_term    = excluded.search_term,
      sort_order     = excluded.sort_order;

-- ----------------------------------------------------------------- lugares
alter table public.places
  add column if not exists wp_category_id integer,
  add column if not exists sort_order smallint not null default 0;

insert into public.places (slug, name, place_type, wp_category_id, sort_order)
values
  ('colombia',     'Colombia',     'pais',         33500, 1),
  ('cali',         'Cali',         'ciudad',       33503, 2),
  ('barranquilla', 'Barranquilla', 'ciudad',       33510, 3),
  ('pasto',        'Pasto',        'ciudad',       33507, 4),
  ('narino',       'Nariño',       'departamento', 33508, 5),
  ('antioquia',    'Antioquia',    'departamento', 67663, 6),
  ('cauca',        'Cauca',        'departamento', 33505, 7)
on conflict (slug) do update
  set name           = excluded.name,
      place_type     = excluded.place_type,
      wp_category_id = excluded.wp_category_id,
      sort_order     = excluded.sort_order;

-- Cali, Barranquilla y Pasto cuelgan de Colombia; los departamentos también.
update public.places hijo
   set parent_id = padre.id
  from public.places padre
 where padre.slug = 'colombia'
   and hijo.slug <> 'colombia'
   and hijo.parent_id is null;

-- --------------------------------------------------- ritmo de las alertas
-- Paso 3 del onboarding. 'ninguno' es una opción legítima: el documento pide
-- que el lector pueda decir que no quiere correos ni notificaciones.
alter table public.profiles
  add column if not exists alert_frequency text not null default 'urgentes';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_alert_frequency_check'
  ) then
    alter table public.profiles
      add constraint profiles_alert_frequency_check
      check (alert_frequency in ('urgentes', 'diario', 'semanal', 'ninguno'));
  end if;
end $$;

-- ------------------------------------------------------------- historias
-- "Un artículo es una publicación; una historia es el conjunto de
-- publicaciones sobre un acontecimiento" (documento, pág. 11). En esta entrega
-- una historia se ancla a una etiqueta de WordPress: es lo que la redacción ya
-- usa, así que no hay que cambiarle el flujo de trabajo.
alter table public.stories
  add column if not exists wp_tag_id integer,
  add column if not exists wp_tag_slug text;

create unique index if not exists stories_wp_tag_unico
  on public.stories (wp_tag_id)
  where wp_tag_id is not null;

-- Seguir / dejar de seguir. Crea la historia la primera vez que alguien la
-- sigue: `stories` no tiene política de escritura, así que solo puede entrar
-- por aquí (definer), nunca desde el navegador con la llave pública.
create or replace function public.seguir_historia(
  p_wp_tag_id integer,
  p_wp_tag_slug text,
  p_titulo text,
  p_seguir boolean,
  p_frecuencia text default 'importantes'
)
returns table (story_id uuid, siguiendo boolean, seguidores integer)
language plpgsql
security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'hace falta iniciar sesión';
  end if;
  if p_frecuencia not in ('importantes', 'todas', 'resumen') then
    raise exception 'frecuencia no válida: %', p_frecuencia;
  end if;

  select s.id into v_id from public.stories s where s.wp_tag_id = p_wp_tag_id;

  if v_id is null then
    insert into public.stories (slug, title, wp_tag_id, wp_tag_slug)
    values (p_wp_tag_slug, p_titulo, p_wp_tag_id, p_wp_tag_slug)
    on conflict (slug) do update set wp_tag_id = excluded.wp_tag_id
    returning id into v_id;
  end if;

  if p_seguir then
    insert into public.followed_stories as f (user_id, story_id, frequency)
    values (v_uid, v_id, p_frecuencia)
    on conflict (user_id, story_id) do update set frequency = excluded.frequency;
  else
    delete from public.followed_stories f
     where f.user_id = v_uid and f.story_id = v_id;
  end if;

  return query
    select v_id,
           exists (select 1 from public.followed_stories f
                    where f.user_id = v_uid and f.story_id = v_id),
           (select count(*)::integer from public.followed_stories f
             where f.story_id = v_id);
end;
$$;

-- Guarda las preferencias del onboarding de una vez, para que no queden a
-- medias si el navegador se cierra entre paso y paso.
create or replace function public.guardar_preferencias(
  p_temas text[],
  p_lugares text[],
  p_frecuencia text
)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'hace falta iniciar sesión';
  end if;
  if p_frecuencia not in ('urgentes', 'diario', 'semanal', 'ninguno') then
    raise exception 'ritmo no válido: %', p_frecuencia;
  end if;

  delete from public.user_topic_preferences where user_id = v_uid;
  insert into public.user_topic_preferences (user_id, topic_id)
  select v_uid, t.id from public.topics t where t.slug = any(p_temas);

  delete from public.user_place_preferences where user_id = v_uid;
  insert into public.user_place_preferences (user_id, place_id)
  select v_uid, l.id from public.places l where l.slug = any(p_lugares);

  update public.profiles
     set alert_frequency = p_frecuencia,
         onboarding_completed = true
   where id = v_uid;
end;
$$;
