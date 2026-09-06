-- =============================================================================
-- Migración 023: clicks de contacto por negocio (analytics interno)
-- =============================================================================

create table if not exists public.eventos_click (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  tipo text not null check (tipo in ('whatsapp', 'instagram', 'facebook', 'web')),
  creado_en timestamptz not null default now()
);

create index if not exists eventos_click_negocio_creado_idx
  on public.eventos_click (negocio_id, creado_en desc);

create index if not exists eventos_click_tipo_creado_idx
  on public.eventos_click (tipo, creado_en desc);

create index if not exists eventos_click_creado_idx
  on public.eventos_click (creado_en desc);

alter table public.eventos_click enable row level security;

-- Lectura solo admin (panel interno)
drop policy if exists "eventos_click_admin_read" on public.eventos_click;
create policy "eventos_click_admin_read"
  on public.eventos_click for select
  to authenticated
  using (public.es_admin());

-- Insert público (API anon / fire-and-forget desde ficha)
drop policy if exists "eventos_click_public_insert" on public.eventos_click;
create policy "eventos_click_public_insert"
  on public.eventos_click for insert
  to anon, authenticated
  with check (
    tipo in ('whatsapp', 'instagram', 'facebook', 'web')
    and negocio_id is not null
  );

comment on table public.eventos_click is
  'Clicks de contacto en fichas de negocio (WhatsApp/Instagram/Facebook/Web). Solo uso interno admin.';
