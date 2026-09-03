-- =============================================================================
-- Migración 019: avisos de mascotas perdidas / encontradas
-- =============================================================================

do $$ begin
  create type public.mascota_aviso_tipo as enum ('perdido', 'encontrado');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.mascota_aviso_estado as enum (
    'pendiente',
    'aprobado',
    'rechazado',
    'inactivo',
    'resuelto'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.mascotas_avisos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null check (char_length(trim(titulo)) between 3 and 60),
  tipo public.mascota_aviso_tipo not null,
  zona text not null,
  foto_url text not null,
  whatsapp_e164 text not null check (whatsapp_e164 ~ '^549[0-9]{8,12}$'),
  fecha_hecho date,
  estado public.mascota_aviso_estado not null default 'pendiente',
  resolve_token text not null unique,
  rechazo_motivo text,
  aprobado_en timestamptz,
  expira_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists mascotas_avisos_estado_creado_idx
  on public.mascotas_avisos (estado, creado_en desc);

create index if not exists mascotas_avisos_tipo_estado_idx
  on public.mascotas_avisos (tipo, estado, creado_en desc);

create index if not exists mascotas_avisos_expira_idx
  on public.mascotas_avisos (expira_en)
  where estado = 'aprobado';

create or replace function public.mascotas_avisos_set_actualizado()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists mascotas_avisos_set_actualizado on public.mascotas_avisos;
create trigger mascotas_avisos_set_actualizado
before update on public.mascotas_avisos
for each row execute function public.mascotas_avisos_set_actualizado();

alter table public.mascotas_avisos enable row level security;

-- Público: solo avisos aprobados y no vencidos
drop policy if exists "mascotas_avisos_public_read" on public.mascotas_avisos;
create policy "mascotas_avisos_public_read"
  on public.mascotas_avisos for select
  to anon, authenticated
  using (
    estado = 'aprobado'
    and (expira_en is null or expira_en > now())
  );

-- Admin: lectura/escritura completa
drop policy if exists "mascotas_avisos_admin_all" on public.mascotas_avisos;
create policy "mascotas_avisos_admin_all"
  on public.mascotas_avisos for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

comment on table public.mascotas_avisos is
  'Avisos públicos de mascotas perdidas/encontradas. Ingreso vía API (service role); listado público solo aprobados.';
