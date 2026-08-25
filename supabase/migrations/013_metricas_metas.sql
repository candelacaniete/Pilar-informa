-- =============================================================================
-- Migración 013: metas de negocios activos (trimestral / semestral)
-- =============================================================================

create table if not exists public.metricas_metas (
  id uuid primary key default gen_random_uuid(),
  periodo text,
  tipo text not null check (tipo in ('trimestral', 'semestral')),
  valor_objetivo integer not null check (valor_objetivo > 0),
  desde date not null,
  hasta date not null,
  activo boolean not null default true,
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint metricas_metas_rango check (hasta >= desde)
);

create index if not exists metricas_metas_activo_idx
  on public.metricas_metas (activo, desde, hasta);

drop trigger if exists metricas_metas_set_actualizado_en on public.metricas_metas;
create trigger metricas_metas_set_actualizado_en
before update on public.metricas_metas
for each row execute function public.set_actualizado_en();

alter table public.metricas_metas enable row level security;

drop policy if exists "metricas_metas_admin_all" on public.metricas_metas;
create policy "metricas_metas_admin_all"
  on public.metricas_metas for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

comment on table public.metricas_metas is
  'Metas de negocios activos (trimestral / semestral), editables desde el admin.';

insert into public.metricas_metas (periodo, tipo, valor_objetivo, desde, hasta, notas)
select * from (values
  ('2026-Q4', 'trimestral', 44, '2026-10-01'::date, '2026-12-31'::date, 'Meta Q4 (oct–dic 2026)'),
  ('2026-H2', 'semestral', 68, '2026-09-01'::date, '2027-02-28'::date, 'Meta H2 (sept 2026–feb 2027)')
) as v(periodo, tipo, valor_objetivo, desde, hasta, notas)
where not exists (
  select 1 from public.metricas_metas m
  where m.periodo = v.periodo and m.tipo = v.tipo
);
