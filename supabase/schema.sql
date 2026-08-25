-- =============================================================================
-- PILAR INFORMA — Esquema Supabase
-- Ejecutar en el SQL Editor de Supabase (en orden).
-- =============================================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Roles de administrador (vinculados a Supabase Auth)
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  nombre text,
  creado_en timestamptz not null default now()
);

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to authenticated, anon;

-- -----------------------------------------------------------------------------
-- Categorías
-- -----------------------------------------------------------------------------
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  icono text,
  orden integer not null default 0,
  creado_en timestamptz not null default now()
);

create index if not exists categorias_orden_idx on public.categorias (orden);

-- -----------------------------------------------------------------------------
-- Negocios
-- -----------------------------------------------------------------------------
create type public.negocio_estado as enum ('activo', 'pausado', 'vencido');
create type public.negocio_plan as enum ('basico', 'destacado', 'premium');

create table if not exists public.negocios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  categoria_id uuid not null references public.categorias (id) on delete restrict,
  subcategoria text,
  descripcion_corta text,
  descripcion_larga text,
  direccion text,
  localidad text,
  lat double precision,
  lng double precision,
  telefono text,
  whatsapp text,
  instagram text,
  web text,
  horarios jsonb not null default '{}'::jsonb,
  rating numeric(2,1) not null default 0,
  cantidad_opiniones integer not null default 0,
  codigo_resena text not null,
  estado public.negocio_estado not null default 'activo',
  plan public.negocio_plan not null default 'destacado',
  fecha_pago date,
  plan_vence timestamptz,
  prioridad integer not null default 100,
  verificado boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists negocios_categoria_idx on public.negocios (categoria_id);
create index if not exists negocios_estado_idx on public.negocios (estado);
create index if not exists negocios_plan_idx on public.negocios (plan);
create index if not exists negocios_plan_vence_idx on public.negocios (plan_vence);
create index if not exists negocios_prioridad_idx on public.negocios (prioridad);
create index if not exists negocios_slug_idx on public.negocios (slug);

create or replace function public.set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists negocios_set_actualizado_en on public.negocios;
create trigger negocios_set_actualizado_en
before update on public.negocios
for each row execute function public.set_actualizado_en();

-- Fotos de negocios
create table if not exists public.negocio_fotos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  url text not null,
  orden integer not null default 0,
  es_principal boolean not null default false,
  creado_en timestamptz not null default now()
);

create index if not exists negocio_fotos_negocio_idx on public.negocio_fotos (negocio_id, orden);

-- Reseñas verificadas (código del negocio)
create type public.resena_estado as enum ('publicada', 'oculta');

create table if not exists public.resenas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  calificacion integer not null check (calificacion between 1 and 5),
  texto text,
  estado public.resena_estado not null default 'publicada',
  ip_hash text,
  creado_en timestamptz not null default now()
);

create index if not exists resenas_negocio_idx on public.resenas (negocio_id, creado_en desc);

-- -----------------------------------------------------------------------------
-- Noticias
-- -----------------------------------------------------------------------------
create type public.noticia_estado as enum ('borrador', 'publicado');

create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  bajada text,
  cuerpo text,
  imagen text,
  categoria text,
  publicado_en timestamptz,
  autor text default 'Redacción Pilar Informa',
  estado public.noticia_estado not null default 'borrador',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists noticias_estado_idx on public.noticias (estado);
create index if not exists noticias_publicado_en_idx on public.noticias (publicado_en desc);
create index if not exists noticias_slug_idx on public.noticias (slug);

drop trigger if exists noticias_set_actualizado_en on public.noticias;
create trigger noticias_set_actualizado_en
before update on public.noticias
for each row execute function public.set_actualizado_en();

-- -----------------------------------------------------------------------------
-- Eventos
-- -----------------------------------------------------------------------------
create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  fecha date not null,
  hora text,
  ubicacion text,
  localidad text,
  descripcion text,
  categoria text,
  imagen text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists eventos_fecha_idx on public.eventos (fecha);
create index if not exists eventos_slug_idx on public.eventos (slug);

drop trigger if exists eventos_set_actualizado_en on public.eventos;
create trigger eventos_set_actualizado_en
before update on public.eventos
for each row execute function public.set_actualizado_en();

-- -----------------------------------------------------------------------------
-- Promociones
-- -----------------------------------------------------------------------------
create type public.promocion_estado as enum ('activa', 'pausada', 'vencida');

create table if not exists public.promociones (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  titulo text not null,
  descuento text,
  descripcion text,
  imagen text,
  valido_desde date,
  valido_hasta date,
  estado public.promocion_estado not null default 'activa',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists promociones_negocio_idx on public.promociones (negocio_id);
create index if not exists promociones_estado_idx on public.promociones (estado);
create index if not exists promociones_valido_hasta_idx on public.promociones (valido_hasta);

drop trigger if exists promociones_set_actualizado_en on public.promociones;
create trigger promociones_set_actualizado_en
before update on public.promociones
for each row execute function public.set_actualizado_en();

-- -----------------------------------------------------------------------------
-- Farmacias de turno (carga manual)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- RLS
-- Lectura pública solo de contenido activo/publicado.
-- Escritura únicamente para admins autenticados.
-- -----------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.categorias enable row level security;
alter table public.negocios enable row level security;
alter table public.negocio_fotos enable row level security;
alter table public.resenas enable row level security;
alter table public.noticias enable row level security;
alter table public.eventos enable row level security;
alter table public.promociones enable row level security;
alter table public.farmacias_turno enable row level security;

-- Admins: solo el propio usuario o admins pueden leer; escritura solo service/manual
drop policy if exists "admins_select_own_or_admin" on public.admins;
create policy "admins_select_own_or_admin"
  on public.admins for select
  to authenticated
  using (id = auth.uid() or public.es_admin());

-- Categorías: lectura pública, escritura admin
drop policy if exists "categorias_public_read" on public.categorias;
create policy "categorias_public_read"
  on public.categorias for select
  to anon, authenticated
  using (true);

drop policy if exists "categorias_admin_write" on public.categorias;
create policy "categorias_admin_write"
  on public.categorias for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- Negocios: lectura pública solo activos
drop policy if exists "negocios_public_read_activos" on public.negocios;
create policy "negocios_public_read_activos"
  on public.negocios for select
  to anon, authenticated
  using (
    estado = 'activo'
    or public.es_admin()
  );

drop policy if exists "negocios_admin_insert" on public.negocios;
create policy "negocios_admin_insert"
  on public.negocios for insert
  to authenticated
  with check (public.es_admin());

drop policy if exists "negocios_admin_update" on public.negocios;
create policy "negocios_admin_update"
  on public.negocios for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "negocios_admin_delete" on public.negocios;
create policy "negocios_admin_delete"
  on public.negocios for delete
  to authenticated
  using (public.es_admin());

-- Fotos: visibles si el negocio es activo (o admin)
drop policy if exists "fotos_public_read" on public.negocio_fotos;
create policy "fotos_public_read"
  on public.negocio_fotos for select
  to anon, authenticated
  using (
    public.es_admin()
    or exists (
      select 1 from public.negocios n
      where n.id = negocio_id and n.estado = 'activo'
    )
  );

drop policy if exists "fotos_admin_write" on public.negocio_fotos;
create policy "fotos_admin_write"
  on public.negocio_fotos for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "resenas_public_read" on public.resenas;
create policy "resenas_public_read"
  on public.resenas for select
  to anon, authenticated
  using (
    estado = 'publicada'
    and exists (
      select 1 from public.negocios n
      where n.id = negocio_id and n.estado = 'activo'
    )
  );

drop policy if exists "resenas_admin_all" on public.resenas;
create policy "resenas_admin_all"
  on public.resenas for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- Noticias: lectura pública solo publicadas
drop policy if exists "noticias_public_read" on public.noticias;
create policy "noticias_public_read"
  on public.noticias for select
  to anon, authenticated
  using (estado = 'publicado' or public.es_admin());

drop policy if exists "noticias_admin_write" on public.noticias;
create policy "noticias_admin_write"
  on public.noticias for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- Eventos: lectura pública de todos (agenda pública)
drop policy if exists "eventos_public_read" on public.eventos;
create policy "eventos_public_read"
  on public.eventos for select
  to anon, authenticated
  using (true);

drop policy if exists "eventos_admin_write" on public.eventos;
create policy "eventos_admin_write"
  on public.eventos for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- Promociones: lectura pública solo activas y vigentes
drop policy if exists "promociones_public_read" on public.promociones;
create policy "promociones_public_read"
  on public.promociones for select
  to anon, authenticated
  using (
    public.es_admin()
    or (
      estado = 'activa'
      and (valido_hasta is null or valido_hasta >= current_date)
      and exists (
        select 1 from public.negocios n
        where n.id = negocio_id and n.estado = 'activo'
      )
    )
  );

drop policy if exists "promociones_admin_write" on public.promociones;
create policy "promociones_admin_write"
  on public.promociones for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- Farmacias de turno: lectura pública, escritura admin
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

-- -----------------------------------------------------------------------------
-- Storage: bucket de medios (también en migrations/007_storage_media_bucket.sql)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.es_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.es_admin())
  with check (bucket_id = 'media' and public.es_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.es_admin());

drop policy if exists "media_admin_write" on storage.objects;
