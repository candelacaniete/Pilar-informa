/**
 * Catálogo de subcategorías por slug de categoría principal.
 * En filtros públicos solo se muestran las que tengan al menos un negocio activo.
 * En alta/admin se ofrece el catálogo completo de la categoría elegida.
 */
export const SUBCATEGORIAS_POR_SLUG = {
  gastronomia: [
    'Pizzería',
    'Hamburguesería',
    'Comida saludable',
    'Café & brunch',
    'Parrilla',
    'Restaurante',
    'Heladería',
    'Panadería',
    'Delivery',
    'Bar',
  ],
  compras: [
    'Indumentaria',
    'Tecnología',
    'Calzado',
    'Hogar y deco',
    'Supermercado',
    'Regalería',
    'Librería',
    'Deportes',
  ],
  salud: [
    'Salud mental',
    'Odontología',
    'Oftalmología',
    'Clínica',
    'Farmacia',
    'Kinesiología',
    'Nutrición',
    'Pediatría',
    'Cardiología',
  ],
  servicios: [
    'Plomería',
    'Electricidad',
    'Limpieza',
    'Mudanzas',
    'Jardinería',
    'Reparaciones',
    'Seguridad',
    'Lavandería',
  ],
  hogar: [
    'Muebles',
    'Decoración',
    'Reformas',
    'Electrodomésticos',
    'Iluminación',
    'Cortinas',
  ],
  automotor: [
    'Transporte',
    'Compra y venta',
    'Taller',
    'Gomería',
    'Lavadero',
    'Repuestos',
    'Seguros',
  ],
  profesionales: [
    'Arquitectura',
    'Inmobiliaria',
    'Abogacía',
    'Contaduría',
    'Diseño',
    'Consultoría',
    'Ingeniería',
    'Traducción',
  ],
  belleza: ['Peluquería', 'Estética', 'Manicura', 'Barbería', 'Spa', 'Maquillaje'],
  educacion: ['Idiomas', 'Apoyo escolar', 'Música', 'Deportes', 'Cursos', 'Guardería'],
  mascotas: ['Veterinaria', 'Peluquería canina', 'Pet shop', 'Adiestramiento'],
  construccion: ['Materiales', 'Albañilería', 'Pinturería', 'Herrería', 'Durlock'],
  tecnologia: ['Desarrollo web', 'Soporte técnico', 'Telefonía', 'Redes'],
  'community-managers': ['Community manager', 'Social media', 'Publicidad digital'],
  'creadores-ugc': ['UGC', 'Contenido audiovisual', 'Fotografía'],
}

export function subcategoriasForSlug(categoriaSlug) {
  if (!categoriaSlug) return []
  return SUBCATEGORIAS_POR_SLUG[categoriaSlug] || []
}

/** Opciones de select: catálogo + valor actual si no está en la lista. */
export function subcategoriaSelectOptions(categoriaSlug, currentValue = '') {
  const base = subcategoriasForSlug(categoriaSlug)
  const current = String(currentValue || '').trim()
  if (current && !base.includes(current)) return [current, ...base]
  return base
}

/** Subcategorías presentes en una lista de negocios (orden del catálogo, luego extras). */
export function subcategoriasPresentes(negocios = [], categoriaSlug) {
  const counts = new Map()
  for (const n of negocios) {
    const raw = String(n.subcategoria || '').trim()
    if (!raw) continue
    counts.set(raw, (counts.get(raw) || 0) + 1)
  }
  const catalog = subcategoriasForSlug(categoriaSlug)
  const ordered = []
  for (const name of catalog) {
    if (counts.has(name)) ordered.push(name)
  }
  for (const name of counts.keys()) {
    if (!ordered.includes(name)) ordered.push(name)
  }
  return ordered
}

/** Zonas/localidades presentes en negocios, priorizando el catálogo de zonas. */
export function zonasPresentes(negocios = [], zonasCatalog = []) {
  const counts = new Map()
  for (const n of negocios) {
    const raw = String(n.localidad || '').trim()
    if (!raw) continue
    counts.set(raw, (counts.get(raw) || 0) + 1)
  }
  const ordered = []
  for (const zona of zonasCatalog) {
    if (counts.has(zona)) ordered.push(zona)
  }
  for (const name of counts.keys()) {
    if (!ordered.includes(name)) ordered.push(name)
  }
  return ordered
}

export function filterNegociosByTipoYZona(negocios = [], { tipos = [], zonas = [] } = {}) {
  const tipoSet = new Set(tipos.map((t) => String(t).trim()).filter(Boolean))
  const zonaSet = new Set(zonas.map((z) => String(z).trim()).filter(Boolean))
  return negocios.filter((n) => {
    const matchTipo = tipoSet.size === 0 || tipoSet.has(String(n.subcategoria || '').trim())
    const matchZona = zonaSet.size === 0 || zonaSet.has(String(n.localidad || '').trim())
    return matchTipo && matchZona
  })
}

/** Categorías con al menos un negocio activo (para menús / filtros). */
export function categoriasConNegocios(categorias = [], negocios = []) {
  const withCount = new Set(
    negocios.map((n) => n.categorias?.slug || n.categoria_id).filter(Boolean),
  )
  return categorias.filter((c) => withCount.has(c.slug) || withCount.has(c.id))
}
