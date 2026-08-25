-- =============================================================================
-- Migración 014: historial de eventos de negocio (renovación / baja / etc.)
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'negocio_evento_tipo') then
    create type public.negocio_evento_tipo as enum (
      'alta',
      'renovacion',
      'baja',
      'cambio_plan'
    );
  end if;
end $$;

create table if not exists public.negocio_eventos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  tipo_evento public.negocio_evento_tipo not null,
  fecha timestamptz not null default now(),
  detalle jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);

create index if not exists negocio_eventos_tipo_fecha_idx
  on public.negocio_eventos (tipo_evento, fecha desc);

create index if not exists negocio_eventos_negocio_fecha_idx
  on public.negocio_eventos (negocio_id, fecha desc);

alter table public.negocio_eventos enable row level security;

drop policy if exists "negocio_eventos_admin_all" on public.negocio_eventos;
create policy "negocio_eventos_admin_all"
  on public.negocio_eventos for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

comment on table public.negocio_eventos is
  'Eventos de ciclo de vida del negocio (forward-looking). Usado para tasa de renovación.';
