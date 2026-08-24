-- =============================================================================
-- Migración 003: categorías digitales, Tecnología cerrada, banners por mes
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Categorías: flag de cierre
-- -----------------------------------------------------------------------------
alter table public.categorias
  add column if not exists cerrada boolean not null default false;

comment on column public.categorias.cerrada is
  'Si true, solo negocios en categoria_permitidos pueden listarse. Sin slots de banner pagos.';

-- Nuevas categorías abiertas
insert into public.categorias (nombre, slug, icono, orden, cerrada) values
  ('Community Managers', 'community-managers', '📱', 13, false),
  ('Creadores UGC', 'creadores-ugc', '🎬', 14, false)
on conflict (slug) do update
  set nombre = excluded.nombre,
      icono = excluded.icono,
      orden = excluded.orden,
      cerrada = excluded.cerrada;

-- Tecnología ya existe: marcarla cerrada
update public.categorias
set cerrada = true,
    nombre = 'Tecnología',
    icono = coalesce(icono, '💻'),
    orden = 12
where slug = 'tecnologia';

insert into public.categorias (nombre, slug, icono, orden, cerrada)
values ('Tecnología', 'tecnologia', '💻', 12, true)
on conflict (slug) do update
  set cerrada = true,
      nombre = excluded.nombre,
      orden = excluded.orden;

-- -----------------------------------------------------------------------------
-- Allowlist para categorías cerradas
-- -----------------------------------------------------------------------------
create table if not exists public.categoria_permitidos (
  categoria_id uuid not null references public.categorias (id) on delete cascade,
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (categoria_id, negocio_id)
);

create index if not exists categoria_permitidos_negocio_idx
  on public.categoria_permitidos (negocio_id);

alter table public.categoria_permitidos enable row level security;

drop policy if exists "categoria_permitidos_public_read" on public.categoria_permitidos;
create policy "categoria_permitidos_public_read"
  on public.categoria_permitidos for select
  to anon, authenticated
  using (true);

drop policy if exists "categoria_permitidos_admin_write" on public.categoria_permitidos;
create policy "categoria_permitidos_admin_write"
  on public.categoria_permitidos for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- Trigger diferido: permite insertar negocio + allowlist en la misma transacción
create or replace function public.enforce_categoria_cerrada()
returns trigger
language plpgsql
as $$
declare
  es_cerrada boolean;
begin
  select c.cerrada into es_cerrada
  from public.categorias c
  where c.id = new.categoria_id;

  if coalesce(es_cerrada, false) then
    if not exists (
      select 1
      from public.categoria_permitidos p
      where p.categoria_id = new.categoria_id
        and p.negocio_id = new.id
    ) then
      raise exception
        'La categoría es cerrada: el negocio debe estar en categoria_permitidos (solo miembros autorizados).';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists negocios_enforce_categoria_cerrada on public.negocios;
create constraint trigger negocios_enforce_categoria_cerrada
after insert or update of categoria_id
on public.negocios
deferrable initially deferred
for each row execute function public.enforce_categoria_cerrada();

-- -----------------------------------------------------------------------------
-- Seed Katem + Konstruct (únicos en Tecnología)
-- -----------------------------------------------------------------------------
with tech as (
  select id from public.categorias where slug = 'tecnologia' limit 1
)
insert into public.negocios (
  nombre, slug, categoria_id, subcategoria, descripcion_corta, descripcion_larga,
  direccion, localidad, web, horarios, rating, cantidad_opiniones,
  estado, plan, fecha_pago, plan_vence, prioridad, verificado
)
select
  v.nombre, v.slug, tech.id, v.subcategoria, v.descripcion_corta, v.descripcion_larga,
  v.direccion, v.localidad, v.web, v.horarios::jsonb, v.rating, v.cantidad_opiniones,
  'activo'::public.negocio_estado, 'premium'::public.negocio_plan,
  current_date, now() + interval '365 days', v.prioridad, true
from tech,
(values
  (
    'Katem',
    'katem',
    'Desarrollo web y producto digital',
    'Agencia de desarrollo web y producto digital.',
    'Katem diseña y desarrolla sitios y productos digitales. Única agencia listada junto a Konstruct en la categoría Tecnología de Guía Pilar.',
    'Pilar, Buenos Aires',
    'Pilar',
    'https://katem.com.ar/',
    '{"texto":"Consultar"}',
    5.0,
    0,
    0
  ),
  (
    'Konstruct',
    'konstruct',
    'Agencia digital',
    'Agencia digital de Pablo — desarrollo y proyectos tecnológicos.',
    'Konstruct es la agencia digital de Pablo. Junto a Katem, son los únicos negocios autorizados en la categoría Tecnología (cerrada) de Guía Pilar.',
    'Pilar, Buenos Aires',
    'Pilar',
    'https://konstruct.com.ar/',
    '{"texto":"Consultar"}',
    5.0,
    0,
    1
  )
) as v(
  nombre, slug, subcategoria, descripcion_corta, descripcion_larga,
  direccion, localidad, web, horarios, rating, cantidad_opiniones, prioridad
)
on conflict (slug) do update
  set
    nombre = excluded.nombre,
    categoria_id = excluded.categoria_id,
    subcategoria = excluded.subcategoria,
    descripcion_corta = excluded.descripcion_corta,
    descripcion_larga = excluded.descripcion_larga,
    web = excluded.web,
    estado = 'activo'::public.negocio_estado,
    plan = 'premium'::public.negocio_plan,
    verificado = true;

-- Fotos principales
insert into public.negocio_fotos (negocio_id, url, orden, es_principal)
select n.id, v.url, 0, true
from (values
  ('katem', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'),
  ('konstruct', 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80')
) as v(slug, url)
join public.negocios n on n.slug = v.slug
where not exists (
  select 1 from public.negocio_fotos f where f.negocio_id = n.id and f.es_principal
);

-- Allowlist (misma transacción que el seed → el trigger diferido valida al commit)
insert into public.categoria_permitidos (categoria_id, negocio_id)
select c.id, n.id
from public.categorias c
join public.negocios n on n.slug in ('katem', 'konstruct')
where c.slug = 'tecnologia'
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Banners (slots por mes calendario)
-- -----------------------------------------------------------------------------
create type public.banner_ubicacion as enum ('home', 'categoria');

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  ubicacion public.banner_ubicacion not null,
  categoria_id uuid references public.categorias (id) on delete cascade,
  slot smallint not null,
  mes date not null,
  imagen_url text not null,
  link_url text not null,
  negocio_id uuid references public.negocios (id) on delete set null,
  titulo text,
  precio_ars integer,
  notas text,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint banners_mes_primer_dia check (mes = date_trunc('month', mes)::date),
  constraint banners_home_slots check (
    (ubicacion = 'home' and categoria_id is null and slot between 1 and 4)
    or (ubicacion = 'categoria' and categoria_id is not null and slot between 1 and 2)
  )
);

create unique index if not exists banners_slot_mes_uidx
  on public.banners (
    ubicacion,
    coalesce(categoria_id, '00000000-0000-0000-0000-000000000000'::uuid),
    slot,
    mes
  )
  where activo = true;

create index if not exists banners_mes_idx on public.banners (mes);
create index if not exists banners_categoria_idx on public.banners (categoria_id);

drop trigger if exists banners_set_actualizado_en on public.banners;
create trigger banners_set_actualizado_en
before update on public.banners
for each row execute function public.set_actualizado_en();

-- No banners pagos en categorías cerradas
create or replace function public.enforce_banner_categoria_abierta()
returns trigger
language plpgsql
as $$
declare
  es_cerrada boolean;
begin
  if new.ubicacion = 'categoria' then
    select c.cerrada into es_cerrada
    from public.categorias c
    where c.id = new.categoria_id;

    if coalesce(es_cerrada, false) then
      raise exception 'No se venden banners en categorías cerradas (ej. Tecnología).';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists banners_enforce_categoria_abierta on public.banners;
create trigger banners_enforce_categoria_abierta
before insert or update on public.banners
for each row execute function public.enforce_banner_categoria_abierta();

alter table public.banners enable row level security;

drop policy if exists "banners_public_read" on public.banners;
create policy "banners_public_read"
  on public.banners for select
  to anon, authenticated
  using (
    public.es_admin()
    or (
      activo = true
      and mes = date_trunc('month', (now() at time zone 'America/Argentina/Buenos_Aires'))::date
    )
  );

drop policy if exists "banners_admin_write" on public.banners;
create policy "banners_admin_write"
  on public.banners for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

comment on table public.banners is
  'Slots publicitarios por mes calendario. Home: 4 slots ($150.000). Categoría abierta: 2 slots ($165.000). Tecnología: sin slots pagos.';

comment on column public.banners.mes is
  'Primer día del mes calendario (ej. 2026-09-01).';
