-- Migración: orden editable de negocios (menor número = aparece primero)
-- Ejecutar en Supabase si el proyecto ya tenía el schema anterior.

alter table public.negocios
  add column if not exists prioridad integer not null default 100;

create index if not exists negocios_prioridad_idx on public.negocios (prioridad);

comment on column public.negocios.prioridad is
  'Orden de aparición. Número más bajo = más arriba. Ej: 0 es el primer lugar.';
