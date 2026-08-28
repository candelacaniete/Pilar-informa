-- =============================================================================
-- GUÍA PILAR — Datos iniciales de ejemplo
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
-- para cerrar Tecnología, allowlist Katem y tabla banners.

-- Noticias reales (Diario Resumen, 26 de agosto de 2026)
insert into public.noticias (titulo, slug, bajada, cuerpo, imagen, categoria, publicado_en, autor, estado) values
(
  'El Municipio avanza con obras de mejora en escuelas y jardines de Zelaya',
  'obras-mejoras-escuelas-zelaya',
  'El Municipio de Pilar avanza con trabajos de mejora edilicia en establecimientos educativos de Zelaya.',
  'El Municipio de Pilar avanza con trabajos de mejora edilicia en establecimientos educativos de Zelaya.',
  'https://images.unsplash.com/photo-1592066575517-58df903152f2?fm=jpg&q=60&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0',
  'Ciudad', '2026-08-26 10:00:00-03'::timestamptz, 'Diario Resumen', 'publicado'
),
(
  'Detuvieron a dos hombres tras un intento de robo de moto en Villa Rosa',
  'detencion-robo-moto-villa-rosa',
  'Dos hombres fueron detenidos en La Lonja luego de intentar robar una motocicleta en Villa Rosa. El seguimiento de cámaras del COM permitió coordinar la interceptación con la Guardia Urbana.',
  'Dos hombres fueron detenidos en La Lonja luego de intentar robar una motocicleta en Villa Rosa. El seguimiento de cámaras del COM permitió coordinar la interceptación con la Guardia Urbana.',
  'https://images.unsplash.com/photo-1675430428387-376cabac44dc?fm=jpg&q=60&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0',
  'Seguridad', '2026-08-26 10:00:00-03'::timestamptz, 'Diario Resumen', 'publicado'
)
on conflict (slug) do nothing;

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
