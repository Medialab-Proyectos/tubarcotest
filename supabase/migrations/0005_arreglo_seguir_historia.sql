-- ============================================================================
-- Arreglo de `seguir_historia`.
--
-- Fallaba con 42702: "column reference story_id is ambiguous". El parámetro de
-- salida se llamaba `story_id`, igual que la columna de `followed_stories`, y
-- dentro de la función PL/pgSQL no puede decidir a cuál se refiere —ni en la
-- lista de columnas del INSERT ni en el ON CONFLICT.
--
-- Se renombra la salida a `id_historia`. Cambiar el nombre de una columna de
-- retorno no lo admite CREATE OR REPLACE, así que hay que soltar la función
-- antes.
-- ============================================================================

drop function if exists public.seguir_historia(integer, text, text, boolean, text);

create function public.seguir_historia(
  p_wp_tag_id integer,
  p_wp_tag_slug text,
  p_titulo text,
  p_seguir boolean,
  p_frecuencia text default 'importantes'
)
returns table (id_historia uuid, siguiendo boolean, seguidores integer)
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
    returning stories.id into v_id;
  end if;

  if p_seguir then
    insert into public.followed_stories (user_id, story_id, frequency)
    values (v_uid, v_id, p_frecuencia)
    on conflict (user_id, story_id) do update set frequency = excluded.frequency;
  else
    delete from public.followed_stories f
     where f.user_id = v_uid and f.story_id = v_id;
  end if;

  return query
    select v_id,
           exists (select 1 from public.followed_stories f2
                    where f2.user_id = v_uid and f2.story_id = v_id),
           (select count(*)::integer from public.followed_stories f3
             where f3.story_id = v_id);
end;
$$;
