-- ============================================================================
-- Reacciones de la nota: "me gusta" / "no me gusta" con contador a la vista.
--
-- Mismo patrón que las visitas (0001): una tabla de eventos para saber quién
-- votó qué —y poder cambiarlo o retirarlo— y una tabla de totales que es la que
-- se lee en la página, para no contar filas en cada visita.
--
-- No exige cuenta: la propuesta pide dar valor antes de pedir registro. La
-- identidad es el mismo identificador anónimo de navegador que ya usan las
-- visitas, en cookie HttpOnly puesta por el servidor, así que desde el
-- navegador no se puede inflar el contador.
-- ============================================================================

create table if not exists public.article_reactions (
  wp_post_id integer primary key,
  slug text not null,
  likes integer not null default 0,
  dislikes integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.article_reaction_events (
  wp_post_id integer not null,
  anonymous_id uuid not null,
  user_id uuid references auth.users (id) on delete set null,
  -- 'up' = me gusta, 'down' = no me gusta.
  reaction text not null check (reaction in ('up', 'down')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (wp_post_id, anonymous_id)
);

-- Registra, cambia o retira el voto y devuelve los totales ya actualizados.
-- Pasar p_reaction = null retira el voto (el lector pulsó lo mismo otra vez).
create or replace function public.registrar_reaccion(
  p_wp_post_id integer,
  p_slug text,
  p_anonymous_id uuid,
  p_reaction text
)
returns table (likes integer, dislikes integer, mi_voto text)
language plpgsql
security definer set search_path = ''
as $$
declare
  v_anterior text;
begin
  if p_reaction is not null and p_reaction not in ('up', 'down') then
    raise exception 'reacción no válida: %', p_reaction;
  end if;

  select ar.reaction into v_anterior
  from public.article_reaction_events ar
  where ar.wp_post_id = p_wp_post_id
    and ar.anonymous_id = p_anonymous_id;

  -- Nada que hacer: ya estaba así.
  if v_anterior is not distinct from p_reaction then
    return query
      select coalesce(t.likes, 0), coalesce(t.dislikes, 0), p_reaction
      from public.article_reactions t
      where t.wp_post_id = p_wp_post_id;
    if not found then
      return query select 0, 0, p_reaction;
    end if;
    return;
  end if;

  if p_reaction is null then
    delete from public.article_reaction_events ev
    where ev.wp_post_id = p_wp_post_id
      and ev.anonymous_id = p_anonymous_id;
  else
    insert into public.article_reaction_events as ev
      (wp_post_id, anonymous_id, user_id, reaction)
    values (p_wp_post_id, p_anonymous_id, auth.uid(), p_reaction)
    on conflict (wp_post_id, anonymous_id) do update
      set reaction = excluded.reaction,
          user_id = excluded.user_id,
          updated_at = now();
  end if;

  -- Ajuste de los totales según el cambio (de nada a voto, de voto a voto, o
  -- de voto a nada).
  insert into public.article_reactions as t (wp_post_id, slug, likes, dislikes, updated_at)
  values (
    p_wp_post_id,
    p_slug,
    case when p_reaction = 'up' then 1 else 0 end,
    case when p_reaction = 'down' then 1 else 0 end,
    now()
  )
  on conflict (wp_post_id) do update
    set likes = greatest(
          0,
          t.likes
            + case when p_reaction = 'up' then 1 else 0 end
            - case when v_anterior = 'up' then 1 else 0 end
        ),
        dislikes = greatest(
          0,
          t.dislikes
            + case when p_reaction = 'down' then 1 else 0 end
            - case when v_anterior = 'down' then 1 else 0 end
        ),
        updated_at = now();

  return query
    select t.likes, t.dislikes, p_reaction
    from public.article_reactions t
    where t.wp_post_id = p_wp_post_id;
end;
$$;

-- ================================================================== RLS
alter table public.article_reactions       enable row level security;
alter table public.article_reaction_events enable row level security;

-- Los totales se pintan para cualquier visitante.
drop policy if exists "reacciones visibles" on public.article_reactions;
create policy "reacciones visibles" on public.article_reactions for select using (true);

-- Los votos individuales no se exponen ni se escriben desde el navegador: solo
-- entran por `registrar_reaccion`, que corre como definer. Sin política de
-- escritura, cualquier intento directo con la llave pública es rechazado.
