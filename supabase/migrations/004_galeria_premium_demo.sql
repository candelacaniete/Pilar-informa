-- =============================================================================
-- Migración 004: galería Premium demo (Casa Marea + Katem + Vet Pilar)
-- =============================================================================
-- La ficha Premium necesita varias fotos para mostrar carrusel + flechas.
-- En producción muchos negocios solo tienen la foto principal.

insert into public.negocio_fotos (negocio_id, url, orden, es_principal)
select n.id, v.url, v.orden, false
from (values
  -- Casa Marea
  ('casa-marea', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80', 1),
  ('casa-marea', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80', 2),
  ('casa-marea', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80', 3),
  ('casa-marea', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=80', 4),
  ('casa-marea', 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80', 5),
  -- Katem
  ('katem', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', 1),
  ('katem', 'https://images.unsplash.com/photo-1555066931-4365d14bf8ed?auto=format&fit=crop&w=1200&q=80', 2),
  ('katem', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', 3),
  -- Vet Pilar
  ('vet-pilar', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80', 1),
  ('vet-pilar', 'https://images.unsplash.com/photo-1587300003388-59208cc962f0?auto=format&fit=crop&w=1200&q=80', 2)
) as v(slug, url, orden)
join public.negocios n on n.slug = v.slug
where not exists (
  select 1 from public.negocio_fotos f
  where f.negocio_id = n.id and f.url = v.url
);
