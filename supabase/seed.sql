-- =============================================================================
-- PILAR INFORMA — Datos iniciales de ejemplo
-- Ejecutar DESPUÉS de schema.sql
-- =============================================================================

-- Categorías
insert into public.categorias (nombre, slug, icono, orden) values
  ('Gastronomía', 'gastronomia', '🍽️', 1),
  ('Compras', 'compras', '🛍️', 2),
  ('Salud', 'salud', '🏥', 3),
  ('Servicios', 'servicios', '🔧', 4),
  ('Hogar', 'hogar', '🏠', 5),
  ('Automotor', 'automotor', '🚗', 6),
  ('Profesionales', 'profesionales', '💼', 7),
  ('Belleza', 'belleza', '💅', 8),
  ('Educación', 'educacion', '📚', 9),
  ('Mascotas', 'mascotas', '🐾', 10),
  ('Construcción', 'construccion', '🧱', 11),
  ('Tecnología', 'tecnologia', '💻', 12),
  ('Community Managers', 'community-managers', '📱', 13),
  ('Creadores UGC', 'creadores-ugc', '🎬', 14)
on conflict (slug) do nothing;

-- Nota: después del schema base, ejecutar migrations/003_categorias_cerradas_banners.sql
-- para cerrar Tecnología, allowlist Katem/Konstruct y tabla banners.

-- Negocios de ejemplo
with cats as (
  select id, slug from public.categorias
)
insert into public.negocios (
  nombre, slug, categoria_id, subcategoria, descripcion_corta, descripcion_larga,
  direccion, localidad, lat, lng, telefono, whatsapp, web, horarios,
  rating, cantidad_opiniones, estado, plan, fecha_pago, plan_vence, prioridad, verificado
)
select * from (values
  (
    'Casa Marea', 'casa-marea',
    (select id from cats where slug = 'gastronomia'),
    'Café & brunch',
    'Café de especialidad, brunch y pastelería artesanal.',
    'Café de especialidad, brunch y pastelería artesanal. Un espacio cálido para encontrarte con amigos o trabajar con buena música de fondo.',
    'Av. San Martín 1240, Pilar Centro', 'Pilar Centro',
    -34.4587, -58.9142, '+54 11 5555-0101', '+54 9 11 5555-0101', 'casamarea.ar',
    '{"texto":"Lun a Dom · 8:00 a 20:00"}'::jsonb,
    4.8, 126, 'activo'::public.negocio_estado, 'premium'::public.negocio_plan,
    current_date - 20, now() + interval '40 days', 0, true
  ),
  (
    'Estudio Norte', 'estudio-norte',
    (select id from cats where slug = 'profesionales'),
    'Arquitectura',
    'Diseño, dirección y remodelación de viviendas.',
    'Diseño, dirección y remodelación de viviendas. Proyectos residenciales con mirada contemporánea y atención a cada detalle.',
    'Calle Las Magnolias 480, Pilar', 'Pilar',
    -34.4612, -58.9085, '+54 11 5555-0202', '+54 9 11 5555-0202', 'estudionorte.com.ar',
    '{"texto":"Lun a Vie · 9:00 a 18:00"}'::jsonb,
    4.9, 48, 'activo'::public.negocio_estado, 'destacado'::public.negocio_plan,
    current_date - 10, now() + interval '5 days', 10, true
  ),
  (
    'Vet Pilar', 'vet-pilar',
    (select id from cats where slug = 'mascotas'),
    'Veterinaria',
    'Clínica veterinaria y atención integral.',
    'Clínica veterinaria y atención integral. Consultas, vacunación, cirugías y guardia para tus mascotas.',
    'Ruta 8 Km 52.5, Del Viso', 'Del Viso',
    -34.4470, -58.9680, '+54 11 5555-0303', '+54 9 11 5555-0303', 'vetpilar.com.ar',
    '{"texto":"Lun a Sáb · 9:00 a 21:00 · Dom guardia"}'::jsonb,
    4.7, 203, 'activo'::public.negocio_estado, 'premium'::public.negocio_plan,
    current_date - 5, now() + interval '25 days', 10, true
  ),
  (
    'Aura Studio', 'belleza-aura',
    (select id from cats where slug = 'belleza'),
    'Peluquería & estética',
    'Corte, color y tratamientos capilares.',
    'Corte, color y tratamientos capilares. Un estudio íntimo con turnos personalizados y productos profesionales.',
    'Italia 890, Pilar Centro', 'Pilar Centro',
    -34.4560, -58.9120, '+54 11 5555-0505', '+54 9 11 5555-0505', 'aurastudio.ar',
    '{"texto":"Mar a Sáb · 10:00 a 19:00"}'::jsonb,
    4.9, 167, 'activo'::public.negocio_estado, 'destacado'::public.negocio_plan,
    current_date - 25, now() + interval '2 days', 20, false
  ),
  (
    'Pulse Fitness', 'pulse-fitness',
    (select id from cats where slug = 'salud'),
    'Gimnasio',
    'Entrenamiento funcional, musculación y clases grupales.',
    'Entrenamiento funcional, musculación y clases grupales. Planes flexibles y seguimiento personalizado.',
    'Camino Real 1500, Manzanares', 'Manzanares',
    -34.4720, -58.9350, '+54 11 5555-0909', '+54 9 11 5555-0909', 'pulsefitness.ar',
    '{"texto":"Lun a Vie · 7:00 a 22:00 · Sáb 8 a 14"}'::jsonb,
    4.6, 188, 'activo'::public.negocio_estado, 'destacado'::public.negocio_plan,
    current_date - 40, now() - interval '3 days', 30, true
  ),
  (
    'Parrilla Lo de Juan', 'parrilla-lo-de-juan',
    (select id from cats where slug = 'gastronomia'),
    'Parrilla',
    'Carnes a la parrilla, pastas y patio con parrillero a la vista.',
    'Parrilla de barrio en Del Viso, con cortes clásicos, ensaladas y menú ejecutivo de mediodía.',
    'Av. Hipólito Yrigoyen 2340, Del Viso', 'Del Viso',
    -34.4492, -58.9635, '+54 11 5555-0707', '+54 9 11 5555-0707', null,
    '{"texto":"Mar a Dom · 12:00 a 15:30 y 20:00 a 00:00"}'::jsonb,
    4.5, 94, 'activo'::public.negocio_estado, 'destacado'::public.negocio_plan,
    current_date - 12, now() + interval '22 days', 15, true
  )
) as v(
  nombre, slug, categoria_id, subcategoria, descripcion_corta, descripcion_larga,
  direccion, localidad, lat, lng, telefono, whatsapp, web, horarios,
  rating, cantidad_opiniones, estado, plan, fecha_pago, plan_vence, prioridad, verificado
)
on conflict (slug) do nothing;

-- Fotos principales
insert into public.negocio_fotos (negocio_id, url, orden, es_principal)
select n.id, v.url, 0, true
from (values
  ('casa-marea', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'),
  ('estudio-norte', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'),
  ('vet-pilar', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80'),
  ('belleza-aura', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'),
  ('pulse-fitness', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'),
  ('parrilla-lo-de-juan', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80')
) as v(slug, url)
join public.negocios n on n.slug = v.slug
on conflict do nothing;

-- Galería Premium demo (Casa Marea): hasta 6 fotos
insert into public.negocio_fotos (negocio_id, url, orden, es_principal)
select n.id, v.url, v.orden, false
from (values
  ('casa-marea', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80', 1),
  ('casa-marea', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80', 2),
  ('casa-marea', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80', 3),
  ('casa-marea', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=80', 4),
  ('casa-marea', 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80', 5)
) as v(slug, url, orden)
join public.negocios n on n.slug = v.slug
where not exists (
  select 1 from public.negocio_fotos f
  where f.negocio_id = n.id and f.url = v.url
);

-- Noticias
insert into public.noticias (titulo, slug, bajada, cuerpo, imagen, categoria, publicado_en, autor, estado) values
(
  'Así avanza la renovación del centro de Pilar: nuevas obras y cambios en el tránsito',
  'renovacion-centro-pilar',
  'Las obras en las calles céntricas avanzan con veredas renovadas, nueva señalización y desvíos temporarios.',
  'Las obras en las calles céntricas avanzan con veredas renovadas, nueva señalización y desvíos temporarios. Te contamos qué cambia esta semana y cómo circular por el centro de Pilar sin contratiempos.',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80',
  'Ciudad', now() - interval '2 hours', 'Redacción Pilar Informa', 'publicado'
),
(
  'Nueva propuesta gastronómica abrió sus puertas en Del Viso',
  'nueva-propuesta-gastronomica-del-viso',
  'Un espacio de cocina de autor y barra de vinos se suma a la escena local.',
  'Un espacio de cocina de autor y barra de vinos se suma a la escena local, con foco en productores de la zona norte.',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
  'Gastronomía', now() - interval '5 hours', 'Redacción Pilar Informa', 'publicado'
),
(
  'La agenda cultural de Pilar para este fin de semana',
  'agenda-cultural-fin-de-semana',
  'Teatros, ferias, música en vivo y actividades al aire libre.',
  'Teatros, ferias, música en vivo y actividades al aire libre para armar el plan perfecto sin salir del partido.',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  'Cultura', now() - interval '8 hours', 'Redacción Pilar Informa', 'publicado'
)
on conflict (slug) do nothing;

-- Eventos
insert into public.eventos (titulo, slug, fecha, hora, ubicacion, localidad, descripcion, categoria, imagen) values
(
  'Feria de emprendedores de Pilar',
  'feria-emprendedores-pilar',
  (current_date + 6), '11:00 a 20:00', 'Plaza 12 de Octubre', 'Pilar Centro',
  'Emprendedores, gastronomía y música en vivo.', 'Feria',
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1000&q=80'
),
(
  'Festival Cultural de Pilar',
  'festival-cultural-pilar',
  (current_date + 7), '16:00 a 22:00', 'Centro Cultural', 'Pilar Centro',
  'Música, teatro callejero y muestras de artistas locales.', 'Cultura',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1000&q=80'
),
(
  'Cine al aire libre en Derqui',
  'cine-al-aire-libre',
  current_date, '20:30', 'Plaza San Martín', 'Derqui',
  'Proyección familiar con food trucks y manta recomendada.', 'Cine',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80'
)
on conflict (slug) do nothing;

-- Promociones
insert into public.promociones (negocio_id, titulo, descuento, descripcion, imagen, valido_desde, valido_hasta, estado)
select n.id, v.titulo, v.descuento, v.descripcion, v.imagen, current_date, current_date + 20, 'activa'::public.promocion_estado
from (values
  ('casa-marea', '20% OFF en Casa Marea', '20% OFF', 'Presentando esta promoción desde Pilar Informa.',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80'),
  ('belleza-aura', '15% OFF en coloración', '15% OFF', 'Reserva tu turno esta semana y mostrá el cupón digital.',
   'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80'),
  ('pulse-fitness', '2x1 en mes de prueba', '2x1', 'Traé a un amigo y prueben el gimnasio sin compromiso.',
   'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1000&q=80')
) as v(slug, titulo, descuento, descripcion, imagen)
join public.negocios n on n.slug = v.slug;

-- Farmacias de turno (horarios de ejemplo para la demo)
insert into public.farmacias_turno (nombre, direccion, localidad, telefono, whatsapp, fecha, horario, notas) values
  ('Farmacia Santa Rita', 'Av. Víctor Vergani 850, Pilar Centro', 'Pilar Centro', '+54 230 444-1101', '+54 9 230 444-1101', current_date, '24 horas', 'Guardia completa. Entrega de recetas hasta las 22 hs.'),
  ('Farmacia Del Viso', 'Ruta 8 Km 53.2, Del Viso', 'Del Viso', '+54 230 444-2202', '+54 9 230 444-2202', current_date, '8:00 a 22:00', 'Atención con receta digital.'),
  ('Farmacia Zelaya', 'Calle Principal 120, Zelaya', 'Zelaya', '+54 230 444-3303', '+54 9 230 444-3303', current_date, '8:00 a 21:00', 'Cerca de la estación.'),
  ('Farmacia Derqui Central', 'Av. Hipólito Yrigoyen 450, Derqui', 'Derqui', '+54 230 444-4404', null, current_date + 1, '8:00 a 22:00', 'Turno de mañana y tarde.'),
  ('Farmacia Manzanares', 'Camino Real 980, Manzanares', 'Manzanares', '+54 230 444-5505', '+54 9 230 444-5505', current_date + 1, '9:00 a 21:00', null),
  ('Farmacia La Lonja', 'Av. Caamaño 2100, La Lonja', 'La Lonja', '+54 230 444-6606', null, current_date + 2, '8:30 a 20:30', null),
  ('Farmacia Villa Rosa', 'Ruta 25 y Calle 12, Villa Rosa', 'Villa Rosa', '+54 230 444-7707', '+54 9 230 444-7707', current_date + 3, '8:00 a 22:00', 'Feriados: consultar WhatsApp.'),
  ('Farmacia Fátima', 'Av. Champagnat 340, Fátima', 'Fátima', '+54 230 444-8808', null, current_date + 4, '9:00 a 21:00', null),
  ('Farmacia Santa Rita', 'Av. Víctor Vergani 850, Pilar Centro', 'Pilar Centro', '+54 230 444-1101', '+54 9 230 444-1101', current_date + 5, '24 horas', 'Fin de semana: guardia 24 hs.'),
  ('Farmacia Del Viso', 'Ruta 8 Km 53.2, Del Viso', 'Del Viso', '+54 230 444-2202', '+54 9 230 444-2202', current_date + 6, '8:00 a 22:00', null);

-- -----------------------------------------------------------------------------
-- IMPORTANTE: crear el primer administrador
-- 1) Creá un usuario en Authentication > Users (email/password)
-- 2) Copiá el UUID del usuario y ejecutá:
--
-- insert into public.admins (id, email, nombre)
-- values ('UUID-DEL-USUARIO', 'admin@pilarinforma.ar', 'Administrador');
-- -----------------------------------------------------------------------------
