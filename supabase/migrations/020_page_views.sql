-- =============================================================================
-- Migración 020: contador de vistas por ficha (negocio / mascota) + referrer
-- =============================================================================

do $$ begin
  create type public.page_view_entity as enum ('negocio', 'mascota');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  entity_type public.page_view_entity not null,
  entity_id uuid not null,
  entity_slug text,
  entity_title text,
  referrer_source text not null default 'directo'
    check (referrer_source in ('instagram', 'whatsapp', 'google', 'directo', 'otro')),
  referrer_raw text,
  creado_en timestamptz not null default now()
);

create index if not exists page_views_entity_creado_idx
  on public.page_views (entity_type, entity_id, creado_en desc);

create index if not exists page_views_creado_idx
  on public.page_views (creado_en desc);

alter table public.page_views enable row level security;

-- Escritura solo vía service role (API). Sin insert público.
-- Lectura admin para el panel de vistas.
drop policy if exists "page_views_admin_read" on public.page_views;
create policy "page_views_admin_read"
  on public.page_views for select
  to authenticated
  using (public.es_admin());

comment on table public.page_views is
  'Vistas de fichas (negocio/mascota) con fuente de tráfico básica.';
