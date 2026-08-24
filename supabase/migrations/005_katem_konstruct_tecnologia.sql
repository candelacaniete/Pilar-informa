-- =============================================================================
-- Migración 005: Katem + Konstruct en Tecnología (cerrada)
-- =============================================================================
-- Idempotente: sirve aunque la 003 no se haya corrido completa en el proyecto.

alter table public.categorias
  add column if not exists cerrada boolean not null default false;

insert into public.categorias (nombre, slug, icono, orden, cerrada)
values ('Tecnología', 'tecnologia', '💻', 12, true)
on conflict (slug) do update
  set cerrada = true,
      nombre = excluded.nombre,
      icono = coalesce(public.categorias.icono, excluded.icono),
      orden = excluded.orden;

create table if not exists public.categoria_permitidos (
  categoria_id uuid not null references public.categorias (id) on delete cascade,
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (categoria_id, negocio_id)
);

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
    'Katem diseña y desarrolla sitios y productos digitales en Pilar. Sitio: https://katem.com.ar',
    'Pilar, Buenos Aires',
    'Pilar',
    'https://katem.com.ar',
    '{"texto":"Consultar"}',
    5.0,
    0,
    0
  ),
  (
    'Konstruct',
    'konstruct',
    'Agencia digital',
    'Agencia digital — desarrollo y proyectos tecnológicos.',
    'Konstruct es la agencia digital de Pablo. Sitio: https://konstruct.com.ar',
    'Pilar, Buenos Aires',
    'Pilar',
    'https://konstruct.com.ar',
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
    verificado = true,
    prioridad = excluded.prioridad;

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

insert into public.categoria_permitidos (categoria_id, negocio_id)
select c.id, n.id
from public.categorias c
join public.negocios n on n.slug in ('katem', 'konstruct')
where c.slug = 'tecnologia'
on conflict do nothing;
