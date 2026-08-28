-- =============================================================================
-- Migración 018: limpieza de contenido demo + noticias reales
-- IRREVERSIBLE en producción — revisar diff antes de aplicar.
-- =============================================================================

-- Negocios demo (cascada: fotos, reseñas, promociones, categoria_permitidos)
delete from public.negocios
where slug in (
  'casa-marea',
  'vet-pilar',
  'estudio-norte',
  'belleza-aura',
  'pulse-fitness',
  'parrilla-lo-de-juan',
  'konstruct'
);

-- Eventos de ejemplo
delete from public.eventos
where slug in (
  'feria-emprendedores-pilar',
  'festival-cultural-pilar',
  'cine-al-aire-libre'
);

-- Noticias de ejemplo
delete from public.noticias
where slug in (
  'renovacion-centro-pilar',
  'nueva-propuesta-gastronomica-del-viso',
  'agenda-cultural-fin-de-semana'
);

-- Katem queda solo en Tecnología: actualizar copy (sin referencia a Konstruct)
update public.negocios
set
  descripcion_larga = 'Katem diseña y desarrolla sitios y productos digitales para marcas y emprendimientos de Pilar y la zona norte.',
  descripcion_corta = 'Agencia de desarrollo web y producto digital.'
where slug = 'katem';

-- Noticias reales (Diario Resumen, 26 de agosto de 2026)
insert into public.noticias (
  titulo, slug, bajada, cuerpo, imagen, categoria, publicado_en, autor, estado
) values
(
  'El Municipio avanza con obras de mejora en escuelas y jardines de Zelaya',
  'obras-mejoras-escuelas-zelaya',
  'El Municipio de Pilar avanza con trabajos de mejora edilicia en establecimientos educativos de Zelaya.',
  'El Municipio de Pilar avanza con trabajos de mejora edilicia en establecimientos educativos de Zelaya.',
  null,
  'Ciudad',
  '2026-08-26 10:00:00-03'::timestamptz,
  'Diario Resumen',
  'publicado'::public.noticia_estado
),
(
  'Detuvieron a dos hombres tras un intento de robo de moto en Villa Rosa',
  'detencion-robo-moto-villa-rosa',
  'Dos hombres fueron detenidos en La Lonja luego de intentar robar una motocicleta en Villa Rosa. El seguimiento de cámaras del COM permitió coordinar la interceptación con la Guardia Urbana.',
  'Dos hombres fueron detenidos en La Lonja luego de intentar robar una motocicleta en Villa Rosa. El seguimiento de cámaras del COM permitió coordinar la interceptación con la Guardia Urbana.',
  null,
  'Seguridad',
  '2026-08-26 10:00:00-03'::timestamptz,
  'Diario Resumen',
  'publicado'::public.noticia_estado
)
on conflict (slug) do update
set
  titulo = excluded.titulo,
  bajada = excluded.bajada,
  cuerpo = excluded.cuerpo,
  categoria = excluded.categoria,
  publicado_en = excluded.publicado_en,
  autor = excluded.autor,
  estado = excluded.estado;
