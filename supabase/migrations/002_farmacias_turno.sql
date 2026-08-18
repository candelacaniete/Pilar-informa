-- Farmacias de turno (carga manual). Ejecutar en el SQL Editor si el proyecto ya existía.

create table if not exists public.farmacias_turno (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  localidad text not null,
  telefono text,
  whatsapp text,
  fecha date not null,
  horario text not null default '8:00 a 22:00',
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists farmacias_turno_fecha_idx on public.farmacias_turno (fecha);
create index if not exists farmacias_turno_localidad_idx on public.farmacias_turno (localidad);

drop trigger if exists farmacias_turno_set_actualizado_en on public.farmacias_turno;
create trigger farmacias_turno_set_actualizado_en
before update on public.farmacias_turno
for each row execute function public.set_actualizado_en();

alter table public.farmacias_turno enable row level security;

drop policy if exists "farmacias_turno_public_read" on public.farmacias_turno;
create policy "farmacias_turno_public_read"
  on public.farmacias_turno for select
  to anon, authenticated
  using (true);

drop policy if exists "farmacias_turno_admin_write" on public.farmacias_turno;
create policy "farmacias_turno_admin_write"
  on public.farmacias_turno for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());
