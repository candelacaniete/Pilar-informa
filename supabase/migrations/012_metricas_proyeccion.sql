-- =============================================================================
-- Migración 012: proyección de ingresos mensual
-- =============================================================================

create table if not exists public.metricas_proyeccion (
  id uuid primary key default gen_random_uuid(),
  mes date not null,
  monto_ars integer not null check (monto_ars >= 0),
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint metricas_proyeccion_mes_primer_dia check (mes = date_trunc('month', mes)::date),
  constraint metricas_proyeccion_mes_unique unique (mes)
);

create index if not exists metricas_proyeccion_mes_idx on public.metricas_proyeccion (mes);

drop trigger if exists metricas_proyeccion_set_actualizado_en on public.metricas_proyeccion;
create trigger metricas_proyeccion_set_actualizado_en
before update on public.metricas_proyeccion
for each row execute function public.set_actualizado_en();

alter table public.metricas_proyeccion enable row level security;

drop policy if exists "metricas_proyeccion_admin_all" on public.metricas_proyeccion;
create policy "metricas_proyeccion_admin_all"
  on public.metricas_proyeccion for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

comment on table public.metricas_proyeccion is
  'Proyección de facturación mensual (ARS), editable desde el admin.';

insert into public.metricas_proyeccion (mes, monto_ars, notas) values
  ('2026-09-01', 484500, 'Proyección original'),
  ('2026-10-01', 1016250, 'Proyección original'),
  ('2026-11-01', 2069800, 'Proyección original'),
  ('2026-12-01', 2513400, 'Proyección original'),
  ('2027-01-01', 2957000, 'Proyección original (70/30)'),
  ('2027-02-01', 3400600, 'Proyección original (70/30)')
on conflict (mes) do update
  set monto_ars = excluded.monto_ars,
      notas = excluded.notas,
      actualizado_en = now();
