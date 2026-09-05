import { createClient } from '@/lib/supabase/server'
import {
  mockBanners,
  mockCategorias,
  mockEventos,
  mockFarmaciasTurno,
  mockNegocios,
  mockNoticias,
  mockPromociones,
  mockResenas,
} from '@/lib/mock/data'
import { currentMonthStart } from '@/lib/banners'
import { daysUntil, sortNegocios, todayInPilar } from '@/lib/utils'

/** Categorías digitales que deben existir aunque Supabase aún no tenga la 003. */
const REQUIRED_CATEGORY_SLUGS = ['community-managers', 'creadores-ugc']

function ensureRequiredCategorias(cats = []) {
  const bySlug = new Map(cats.map((c) => [c.slug, c]))
  for (const slug of REQUIRED_CATEGORY_SLUGS) {
    if (bySlug.has(slug)) continue
    const fromMock = mockCategorias.find((c) => c.slug === slug)
    if (fromMock) bySlug.set(slug, { ...fromMock })
  }
  // Tecnología cerrada si ya está en la lista
  if (bySlug.has('tecnologia')) {
    bySlug.set('tecnologia', { ...bySlug.get('tecnologia'), cerrada: true })
  }
  return [...bySlug.values()].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
}

// No pedir `cerrada` ni `fuente_alta` en selects base: si las migraciones 003/011
// aún no corrieron, PostgREST falla y vacía la guía / el admin.
// codigo_resena solo en select admin (no exponer en la web pública).
const negocioColumns = `
  id, nombre, slug, categoria_id, subcategoria, descripcion_corta, descripcion_larga,
  direccion, localidad, lat, lng, telefono, whatsapp, instagram, web, horarios,
  rating, cantidad_opiniones, estado, plan, fecha_pago, plan_vence, prioridad, verificado,
  creado_en, actualizado_en
`

const negocioSelectPublic = `
  ${negocioColumns},
  categorias ( id, nombre, slug, icono ),
  negocio_fotos ( id, url, orden, es_principal ),
  negocio_instagram_posts ( id, post_url, thumbnail_url, caption, orden, synced_at )
`

const negocioSelectAdmin = `
  ${negocioColumns}, codigo_resena,
  categorias ( id, nombre, slug, icono ),
  negocio_fotos ( id, url, orden, es_principal ),
  negocio_instagram_posts ( id, post_url, thumbnail_url, caption, orden, synced_at )
`

async function sb() {
  return createClient()
}

export async function getCategorias() {
  const supabase = await sb()
  if (!supabase) return ensureRequiredCategorias(mockCategorias)
  const { data, error } = await supabase.from('categorias').select('*').order('orden')
  if (error || !data?.length) return ensureRequiredCategorias(mockCategorias)
  return ensureRequiredCategorias(data)
}

export async function getCategoriaBySlug(slug) {
  const cats = await getCategorias()
  return cats.find((c) => c.slug === slug) || null
}

export async function getNegociosActivos({ categoriaSlug, destacados, limit } = {}) {
  const supabase = await sb()
  if (!supabase) {
    let list = mockNegocios.filter((n) => n.estado === 'activo')
    if (categoriaSlug) {
      list = list.filter((n) => n.categorias?.slug === categoriaSlug)
    }
    if (destacados) {
      list = list.filter((n) => n.plan === 'premium' || n.plan === 'destacado')
    }
    list = sortNegocios(list)
    return limit ? list.slice(0, limit) : list
  }

  let query = supabase
    .from('negocios')
    .select(negocioSelectPublic)
    .eq('estado', 'activo')
    .order('prioridad', { ascending: true })
    .order('nombre', { ascending: true })

  if (categoriaSlug) {
    const cat = await getCategoriaBySlug(categoriaSlug)
    if (cat) query = query.eq('categoria_id', cat.id)
  }

  const { data, error } = await query
  if (error || !data) {
    // Si el schema aún no está al día, no vaciar la guía: usar mock de demo.
    console.error('getNegociosActivos:', error?.message || 'sin datos')
    let list = mockNegocios.filter((n) => n.estado === 'activo')
    if (categoriaSlug) list = list.filter((n) => n.categorias?.slug === categoriaSlug)
    if (destacados) list = list.filter((n) => n.plan === 'premium' || n.plan === 'destacado')
    list = sortNegocios(list)
    return limit ? list.slice(0, limit) : list
  }
  let list = sortNegocios(data)
  if (destacados) {
    list = list.filter((n) => n.plan === 'premium' || n.plan === 'destacado')
  }
  return limit ? list.slice(0, limit) : list
}

export async function getNegocioBySlug(slug) {
  const supabase = await sb()
  if (!supabase) {
    return mockNegocios.find((n) => n.slug === slug && n.estado === 'activo') || null
  }
  const { data, error } = await supabase
    .from('negocios')
    .select(negocioSelectPublic)
    .eq('slug', slug)
    .eq('estado', 'activo')
    .maybeSingle()
  if (error) return null
  return data
}

export async function getNoticias({ limit } = {}) {
  const supabase = await sb()
  if (!supabase) {
    const list = mockNoticias.filter((n) => n.estado === 'publicado')
    return limit ? list.slice(0, limit) : list
  }
  let query = supabase
    .from('noticias')
    .select('*')
    .eq('estado', 'publicado')
    .order('publicado_en', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error || !data) return []
  return data
}

export async function getNoticiaBySlug(slug) {
  const supabase = await sb()
  if (!supabase) {
    return mockNoticias.find((n) => n.slug === slug && n.estado === 'publicado') || null
  }
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('slug', slug)
    .eq('estado', 'publicado')
    .maybeSingle()
  if (error) return null
  return data
}

export async function getEventos({ fromToday = true, limit } = {}) {
  const supabase = await sb()
  if (!supabase) {
    let list = [...mockEventos].sort((a, b) => a.fecha.localeCompare(b.fecha))
    if (fromToday) {
      const today = new Date().toISOString().slice(0, 10)
      list = list.filter((e) => e.fecha >= today)
    }
    return limit ? list.slice(0, limit) : list
  }
  let query = supabase.from('eventos').select('*').order('fecha', { ascending: true })
  if (fromToday) {
    const today = new Date().toISOString().slice(0, 10)
    query = query.gte('fecha', today)
  }
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error || !data) return []
  return data
}

export async function getEventoBySlug(slug) {
  const supabase = await sb()
  if (!supabase) return mockEventos.find((e) => e.slug === slug) || null
  const { data, error } = await supabase.from('eventos').select('*').eq('slug', slug).maybeSingle()
  if (error) return null
  return data
}

export async function getPromociones({ limit } = {}) {
  const supabase = await sb()
  if (!supabase) {
    const list = mockPromociones.filter((p) => p.estado === 'activa')
    return limit ? list.slice(0, limit) : list
  }
  let query = supabase
    .from('promociones')
    .select('*, negocios ( id, nombre, slug )')
    .eq('estado', 'activa')
    .order('valido_hasta', { ascending: true })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error || !data) return []
  return data
}

export async function getFarmaciasTurno({ fromDate, toDate, localidad } = {}) {
  const today = todayInPilar()
  const from = fromDate || today
  const to = toDate || from

  const supabase = await sb()
  if (!supabase) {
    let list = mockFarmaciasTurno.filter((f) => f.fecha >= from && f.fecha <= to)
    if (localidad) {
      const zona = localidad.toLowerCase()
      list = list.filter((f) => (f.localidad || '').toLowerCase().includes(zona))
    }
    return list.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.localidad.localeCompare(b.localidad, 'es'))
  }

  let query = supabase
    .from('farmacias_turno')
    .select('*')
    .gte('fecha', from)
    .lte('fecha', to)
    .order('fecha', { ascending: true })
    .order('localidad', { ascending: true })

  if (localidad) query = query.ilike('localidad', `%${localidad}%`)

  const { data, error } = await query
  if (error || !data) return []
  return data
}

export async function getAllFarmaciasTurnoAdmin() {
  const supabase = await sb()
  if (!supabase) {
    return [...mockFarmaciasTurno].sort((a, b) => b.fecha.localeCompare(a.fecha))
  }
  const { data, error } = await supabase
    .from('farmacias_turno')
    .select('*')
    .order('fecha', { ascending: false })
    .order('localidad', { ascending: true })
  if (error || !data) return []
  return data
}

/**
 * Estado del scrape Colfarma para banners públicos/admin.
 * stale = último OK viejo (>30 h) o último run falló.
 */
export async function getFarmaciasScrapeStatus() {
  const { COLFARMA_TURNO_URL, COLFARMA_HOME_URL, SCRAPE_STALE_AFTER_MS } = await import(
    '@/lib/farmacias/constants'
  )

  const empty = {
    usingMock: true,
    lastRun: null,
    lastOkAt: null,
    stale: false,
    failed: false,
    officialTurnoUrl: COLFARMA_TURNO_URL,
    officialHomeUrl: COLFARMA_HOME_URL,
  }

  const supabase = await sb()
  if (!supabase) return empty

  const { data: runs, error } = await supabase
    .from('farmacias_scrape_runs')
    .select('id, started_at, finished_at, ok, farmacias_count, error_message, source_url')
    .order('started_at', { ascending: false })
    .limit(5)

  if (error || !runs?.length) {
    // Tabla ausente o sin corridas: no alarmamos en público; admin verá "sin scrape".
    return {
      ...empty,
      usingMock: false,
      stale: false,
      failed: false,
      neverRan: true,
    }
  }

  const lastRun = runs[0]
  const lastOk = runs.find((r) => r.ok === true)
  const lastOkAt = lastOk?.finished_at || lastOk?.started_at || null
  const failed = lastRun.ok === false
  const ageMs = lastOkAt ? Date.now() - new Date(lastOkAt).getTime() : Infinity
  const stale = failed || !lastOkAt || ageMs > SCRAPE_STALE_AFTER_MS

  return {
    usingMock: false,
    lastRun,
    lastOkAt,
    stale,
    failed,
    neverRan: false,
    officialTurnoUrl: COLFARMA_TURNO_URL,
    officialHomeUrl: COLFARMA_HOME_URL,
  }
}

export async function getFarmaciasDirectorio({ localidad } = {}) {
  const supabase = await sb()
  if (!supabase) return []

  let query = supabase
    .from('farmacias')
    .select('id, nombre, direccion, localidad, telefono, maps_url')
    .eq('activo', true)
    .order('localidad', { ascending: true })
    .order('nombre', { ascending: true })

  if (localidad) query = query.ilike('localidad', `%${localidad}%`)

  const { data, error } = await query
  if (error || !data) return []
  return data
}

/** Admin helpers (requieren sesión admin; usan cliente server) */
export async function getAdminDashboardStats() {
  const supabase = await sb()
  if (!supabase) {
    const activos = mockNegocios.filter((n) => n.estado === 'activo').length
    const porVencerSemana = mockNegocios.filter((n) => {
      const d = daysUntil(n.plan_vence)
      return d !== null && d >= 0 && d <= 7
    }).length
    const porVencerMes = mockNegocios.filter((n) => {
      const d = daysUntil(n.plan_vence)
      return d !== null && d >= 0 && d <= 30
    }).length
    const vencidos = mockNegocios.filter((n) => n.estado === 'vencido' || daysUntil(n.plan_vence) < 0)
      .length
    return {
      activos,
      porVencerSemana,
      porVencerMes,
      vencidos,
      ultimasNoticias: mockNoticias.slice(0, 4),
      usingMock: true,
    }
  }

  const [{ count: activos }, negocios, noticias] = await Promise.all([
    supabase.from('negocios').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
    supabase.from('negocios').select('id, nombre, plan_vence, estado'),
    supabase
      .from('noticias')
      .select('id, titulo, slug, estado, publicado_en')
      .order('creado_en', { ascending: false })
      .limit(4),
  ])

  const porVencerSemana = (negocios.data || []).filter((n) => {
    const d = daysUntil(n.plan_vence)
    return d !== null && d >= 0 && d <= 7
  }).length
  const porVencerMes = (negocios.data || []).filter((n) => {
    const d = daysUntil(n.plan_vence)
    return d !== null && d >= 0 && d <= 30
  }).length
  const vencidos = (negocios.data || []).filter(
    (n) => n.estado === 'vencido' || daysUntil(n.plan_vence) < 0,
  ).length

  return {
    activos: activos || 0,
    porVencerSemana,
    porVencerMes,
    vencidos,
    ultimasNoticias: noticias.data || [],
    usingMock: false,
  }
}

export async function getAllNegociosAdmin() {
  const supabase = await sb()
  if (!supabase) return sortNegocios(mockNegocios)
  const { data, error } = await supabase
    .from('negocios')
    .select(negocioSelectAdmin)
    .order('prioridad', { ascending: true })
  if (error || !data) return []
  return sortNegocios(data)
}

export async function getNegocioAdminById(id) {
  const supabase = await sb()
  if (!supabase) return mockNegocios.find((n) => n.id === id) || null
  const { data, error } = await supabase
    .from('negocios')
    .select(negocioSelectAdmin)
    .eq('id', id)
    .maybeSingle()
  if (error) return null
  return data
}

export async function getAllNoticiasAdmin() {
  const supabase = await sb()
  if (!supabase) return mockNoticias
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .order('actualizado_en', { ascending: false })
  if (error || !data) return []
  return data
}

export async function getAllEventosAdmin() {
  const supabase = await sb()
  if (!supabase) return mockEventos
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('fecha', { ascending: false })
  if (error || !data) return []
  return data
}

export async function getAllPromocionesAdmin() {
  const supabase = await sb()
  if (!supabase) return mockPromociones
  const { data, error } = await supabase
    .from('promociones')
    .select('*, negocios ( id, nombre, slug )')
    .order('actualizado_en', { ascending: false })
  if (error || !data) return []
  return data
}

export async function getBannersForMonth({ mes, ubicacion, categoriaId } = {}) {
  const month = mes || currentMonthStart()
  const supabase = await sb()
  if (!supabase) {
    return mockBanners.filter((b) => {
      if (b.mes !== month || !b.activo) return false
      if (ubicacion && b.ubicacion !== ubicacion) return false
      if (ubicacion === 'home') return !b.categoria_id
      if (categoriaId) return b.categoria_id === categoriaId
      return true
    })
  }

  let query = supabase
    .from('banners')
    .select('*, categorias ( id, nombre, slug ), negocios ( id, nombre, slug )')
    .eq('mes', month)
    .eq('activo', true)
    .order('slot', { ascending: true })

  if (ubicacion) query = query.eq('ubicacion', ubicacion)
  if (ubicacion === 'home') query = query.is('categoria_id', null)
  if (categoriaId) query = query.eq('categoria_id', categoriaId)

  const { data, error } = await query
  if (error || !data) return []
  return data
}

export async function getAllBannersAdmin({ mes } = {}) {
  const month = mes || currentMonthStart()
  const supabase = await sb()
  if (!supabase) {
    return mockBanners
      .filter((b) => b.mes === month)
      .sort((a, b) => a.ubicacion.localeCompare(b.ubicacion) || a.slot - b.slot)
  }
  const { data, error } = await supabase
    .from('banners')
    .select('*, categorias ( id, nombre, slug ), negocios ( id, nombre, slug )')
    .eq('mes', month)
    .order('ubicacion', { ascending: true })
    .order('slot', { ascending: true })
  if (error || !data) return []
  return data
}

export async function getBannerAdminById(id) {
  const supabase = await sb()
  if (!supabase) return mockBanners.find((b) => b.id === id) || null
  const { data, error } = await supabase
    .from('banners')
    .select('*, categorias ( id, nombre, slug ), negocios ( id, nombre, slug )')
    .eq('id', id)
    .maybeSingle()
  if (error) return null
  return data
}

/** Categorías donde se pueden vender banners (todas menos cerradas). */
export async function getCategoriasConBanners() {
  const cats = await getCategorias()
  return cats.filter((c) => !c.cerrada)
}

export async function getResenasPublicas(negocioId, { limit = 20 } = {}) {
  const supabase = await sb()
  if (!supabase) {
    return mockResenas
      .filter((r) => r.negocio_id === negocioId && r.estado === 'publicada')
      .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
      .slice(0, limit)
  }

  const { data, error } = await supabase
    .from('resenas')
    .select('id, negocio_id, calificacion, texto, creado_en')
    .eq('negocio_id', negocioId)
    .eq('estado', 'publicada')
    .order('creado_en', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data
}

export async function getResenasAdmin(negocioId) {
  const supabase = await sb()
  if (!supabase) {
    return mockResenas
      .filter((r) => r.negocio_id === negocioId)
      .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
  }

  const { data, error } = await supabase
    .from('resenas')
    .select('id, negocio_id, calificacion, texto, estado, creado_en')
    .eq('negocio_id', negocioId)
    .order('creado_en', { ascending: false })

  if (error || !data) return []
  return data
}

export async function getResenasByNegocioSlug(slug) {
  const negocio = await getNegocioBySlug(slug)
  if (!negocio) return []
  return getResenasPublicas(negocio.id)
}
