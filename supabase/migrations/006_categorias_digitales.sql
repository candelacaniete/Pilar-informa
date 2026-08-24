-- =============================================================================
-- Migración 006: categorías digitales (Community Managers + Creadores UGC)
-- =============================================================================
-- Idempotente. No toca negocios ni banners; solo asegura las dos categorías
-- abiertas pedidas para /guia y el resto del sitio.

alter table public.categorias
  add column if not exists cerrada boolean not null default false;

insert into public.categorias (nombre, slug, icono, orden, cerrada) values
  ('Community Managers', 'community-managers', '📱', 13, false),
  ('Creadores UGC', 'creadores-ugc', '🎬', 14, false)
on conflict (slug) do update
  set nombre = excluded.nombre,
      icono = excluded.icono,
      orden = excluded.orden,
      cerrada = excluded.cerrada;
