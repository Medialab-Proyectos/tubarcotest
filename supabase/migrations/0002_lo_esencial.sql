-- "Lo esencial": los tres puntos que resumen una nota.
--
-- Se guarda el resultado para no volver a generarlo en cada visita. `content_hash`
-- detecta que la nota cambió en WordPress: si el texto ya no es el mismo, el
-- resumen se regenera en vez de quedarse desactualizado.
--
-- `source` distingue de dónde salió:
--   'extractivo' → frases tomadas del propio artículo, sin modelo de por medio
--   'ia'         → generado por el proveedor configurado
-- Esa columna es la que permite cambiar a IA sin migrar nada más.

create table if not exists public.article_essentials (
  wp_post_id integer primary key,
  slug text not null,
  bullets text[] not null,
  source text not null default 'extractivo'
    check (source in ('extractivo', 'ia')),
  model text,
  -- Flujo editorial de la propuesta: la IA no publica sola. Mientras el
  -- resumen sea extractivo puede mostrarse tal cual; cuando lo genere un
  -- modelo, la redacción decide si pasa a 'aprobado'.
  status text not null default 'generado'
    check (status in ('generado', 'pendiente_revision', 'aprobado', 'rechazado')),
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists article_essentials_slug_idx
  on public.article_essentials (slug);

alter table public.article_essentials enable row level security;

-- Lectura para cualquiera: el resumen se muestra sin necesidad de cuenta.
drop policy if exists "esenciales visibles" on public.article_essentials;
create policy "esenciales visibles" on public.article_essentials
  for select using (status <> 'rechazado');

-- Sin política de escritura: solo el servidor (llave de servicio) puede
-- generar o corregir resúmenes. Nadie puede inyectar texto en una nota.
