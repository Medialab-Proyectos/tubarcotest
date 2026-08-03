-- ============================================================================
-- Lugares que faltaban en el onboarding.
--
-- La 0004 sembró los siete que el documento pone de ejemplo (págs. 9-10), pero
-- el propio documento advierte que la taxonomía debe ser canónica y no copiar
-- el menú. Al contrastarla con WordPress aparecieron tres regiones reales, con
-- más archivo que varias de las que sí se ofrecían:
--
--   Caribe  4.051 notas      Valle 3.578      Bogotá 1.309
--   (frente a Nariño 3.711, Pasto 2.340, Antioquia 1.080, Cauca 717)
--
-- "Internacional" NO entra aquí: ya se ofrece como el tema "Mundo", que apunta
-- a esa misma categoría (35616). Duplicarlo como lugar confundiría al lector y
-- partiría en dos las preferencias sobre el mismo contenido.
-- ============================================================================

-- El Caribe es una región: no encaja en país, departamento ni ciudad, que eran
-- los únicos tipos que admitía la tabla.
alter table public.places drop constraint if exists places_place_type_check;
alter table public.places
  add constraint places_place_type_check
  check (place_type in ('pais', 'region', 'departamento', 'ciudad'));

insert into public.places (slug, name, place_type, wp_category_id, sort_order)
values
  ('valle',   'Valle',   'departamento', 33504, 8),
  ('caribe',  'Caribe',  'region',       33509, 9),
  ('bogota',  'Bogotá',  'ciudad',       47313, 10)
on conflict (slug) do update
  set name           = excluded.name,
      place_type     = excluded.place_type,
      wp_category_id = excluded.wp_category_id,
      sort_order     = excluded.sort_order;

-- Los tres cuelgan de Colombia, como el resto.
update public.places hijo
   set parent_id = padre.id
  from public.places padre
 where padre.slug = 'colombia'
   and hijo.slug in ('valle', 'caribe', 'bogota')
   and hijo.parent_id is null;

-- Orden final: el país primero y después por volumen de archivo, para que las
-- opciones con más contenido no queden al fondo de la lista.
update public.places set sort_order = 1  where slug = 'colombia';
update public.places set sort_order = 2  where slug = 'cali';
update public.places set sort_order = 3  where slug = 'caribe';
update public.places set sort_order = 4  where slug = 'narino';
update public.places set sort_order = 5  where slug = 'valle';
update public.places set sort_order = 6  where slug = 'pasto';
update public.places set sort_order = 7  where slug = 'barranquilla';
update public.places set sort_order = 8  where slug = 'bogota';
update public.places set sort_order = 9  where slug = 'antioquia';
update public.places set sort_order = 10 where slug = 'cauca';
