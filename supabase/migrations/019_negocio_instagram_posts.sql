-- Migración 019: posts de Instagram cacheados para fichas Premium

create table if not exists public.negocio_instagram_posts (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  post_url text not null,
  thumbnail_url text,
  caption text,
  orden smallint not null default 0,
  synced_at timestamptz,
  creado_en timestamptz not null default now(),
  constraint negocio_instagram_posts_url_unique unique (negocio_id, post_url)
);

create index if not exists negocio_instagram_posts_negocio_idx
  on public.negocio_instagram_posts (negocio_id, orden);

comment on table public.negocio_instagram_posts is
  'Vista previa cacheada de publicaciones de Instagram (solo plan Premium).';

alter table public.negocio_instagram_posts enable row level security;

drop policy if exists "instagram_posts_public_read" on public.negocio_instagram_posts;
create policy "instagram_posts_public_read"
  on public.negocio_instagram_posts for select
  to anon, authenticated
  using (
    public.es_admin()
    or exists (
      select 1
      from public.negocios n
      where n.id = negocio_id
        and n.estado = 'activo'
        and n.plan = 'premium'
    )
  );

drop policy if exists "instagram_posts_admin_write" on public.negocio_instagram_posts;
create policy "instagram_posts_admin_write"
  on public.negocio_instagram_posts for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());
