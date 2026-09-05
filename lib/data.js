import { createClient } from '@/lib/supabase/server'
import {
  mockBanners,
  mockCategorias,
  mockEventos,
  mockFarmaciasTurno,
  mockMascotasAvisos,
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
// Instagram NO va en el select base: si falta la migración 019_negocio_instagram_posts,
// PostgREST rompe TODOS los listados (admin vacío + frontend en mock).
const negocioColumns = `
  id, nombre, slug, categoria_id, subcategoria, descripcion_corta, descripcion_larga,
  direccion, localidad, lat, lng, telefono, whatsapp, instagram, web, horarios,
  rating, cantidad_opiniones, estado, plan, fecha_pago, plan_vence, prioridad, verificado,
  creado_en, actualizado_en
`

const negocioSelectPublic = `
  ${negocioColumns},
  categorias ( id, nombre, slug, icono ),
  negocio_fotos ( id, url, orden, es_principal )
`

const negocioSelectAdmin = `
  ${negocioColumns}, codigo_resena,
  categorias ( id, nombre, slug, icono ),
  negocio_fotos ( id, url, orden, es_principal )
`

const negocioSelectPublicWithIg = `
  ${negocioSelectPublic},
  negocio_instagram_posts ( id, post_url, thumbnail_url, caption, orden, synced_at )
`

const negocioSelectAdminWithIg = `
  ${negocioSelectAdmin},
  negocio_instagram_posts ( id, post_url, thumbnail_url, caption, orden, synced_at )
`

function isMissingInstagramRelation(error) {
  const msg = error?.message || ''
  return /negocio_instagram_posts|could not find|relationship|schema cache|does not exist/i.test(msg)
}

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

  let { data, error } = await supabase
    .from('negocios')
    .select(negocioSelectPublicWithIg)
    .eq('slug', slug)
    .eq('estado', 'activo')
    .maybeSingle()

  if (error && isMissingInstagramRelation(error)) {
    console.warn(
      'getNegocioBySlug: sin tabla Instagram, fallback. Corré 019_negocio_instagram_posts.sql',
      error.message,
    )
    ;({ data, error } = await supabase
      .from('negocios')
      .select(negocioSelectPublic)
      .eq('slug', slug)
      .eq('estado', 'activo')
      .maybeSingle())
  }

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
  if (error || !data) {
    console.error('getAllNegociosAdmin:', error?.message || 'sin datos')
    return []
  }
  return sortNegocios(data)
}

export async function getNegocioAdminById(id) {
  const supabase = await sb()
  if (!supabase) return mockNegocios.find((n) => n.id === id) || null

  let { data, error } = await supabase
    .from('negocios')
    .select(negocioSelectAdminWithIg)
    .eq('id', id)
    .maybeSingle()

  if (error && isMissingInstagramRelation(error)) {
    console.warn(
      'getNegocioAdminById: sin tabla Instagram, fallback. Corré 019_negocio_instagram_posts.sql',
      error.message,
    )
    ;({ data, error } = await supabase
      .from('negocios')
      .select(negocioSelectAdmin)
      .eq('id', id)
      .maybeSingle())
  }

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

const mascotaColumns = `
  id, slug, titulo, tipo, zona, foto_url, whatsapp_e164, fecha_hecho,
  estado, rechazo_motivo, aprobado_en, expira_en, creado_en, actualizado_en
`

function isMascotaPublicVisible(aviso) {
  if (!aviso || aviso.estado !== 'aprobado') return false
  if (!aviso.expira_en) return true
  return new Date(aviso.expira_en) > new Date()
}

export async function getMascotasAvisosPublicos({ tipo } = {}) {
  const supabase = await sb()
  if (!supabase) {
    return mockMascotasAvisos
      .filter(isMascotaPublicVisible)
      .filter((a) => !tipo || a.tipo === tipo)
      .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
      .map(({ resolve_token: _t, whatsapp_e164: _w, ...rest }) => ({
        ...rest,
        // whatsapp solo como flag; el link se arma en UI sin mostrar número
        has_whatsapp: true,
        whatsapp_e164: _w,
      }))
  }

  let query = supabase
    .from('mascotas_avisos')
    .select(mascotaColumns)
    .eq('estado', 'aprobado')
    .order('creado_en', { ascending: false })

  if (tipo === 'perdido' || tipo === 'encontrado') {
    query = query.eq('tipo', tipo)
  }

  const { data, error } = await query
  if (error || !data) {
    // Tabla aún no migrada
    if (/relation|does not exist|schema cache/i.test(error?.message || '')) {
      return mockMascotasAvisos.filter(isMascotaPublicVisible)
    }
    return []
  }

  return data.filter(isMascotaPublicVisible)
}

export async function getMascotaAvisoBySlug(slug) {
  if (!slug) return null
  const supabase = await sb()
  if (!supabase) {
    const found = mockMascotasAvisos.find(
      (a) => a.slug === slug && isMascotaPublicVisible(a),
    )
    return found || null
  }

  const { data, error } = await supabase
    .from('mascotas_avisos')
    .select(mascotaColumns)
    .eq('slug', slug)
    .eq('estado', 'aprobado')
    .maybeSingle()

  if (error || !data || !isMascotaPublicVisible(data)) return null
  return data
}

export async function getMascotaAvisoByResolveToken(token) {
  if (!token) return null
  const supabase = await sb()
  if (!supabase) {
    return mockMascotasAvisos.find((a) => a.resolve_token === token) || null
  }

  const { createServerWriteClient, createServiceClient } = await import('@/lib/supabase/admin')
  const { client } = createServerWriteClient()
  const db = client || createServiceClient() || supabase

  // RPC (migración 021) — funciona con anon key
  const { data: rpcRows, error: rpcError } = await db.rpc('mascota_aviso_por_token', {
    p_token: token,
  })
  if (!rpcError && rpcRows) {
    const row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows
    if (row) return row
  }

  // Fallback service role / lectura directa
  const { data } = await db
    .from('mascotas_avisos')
    .select(`${mascotaColumns}, resolve_token`)
    .eq('resolve_token', token)
    .maybeSingle()

  return data || null
}

const ESTADO_SORT = { pendiente: 0, aprobado: 1, rechazado: 2, inactivo: 3, resuelto: 4 }

export async function getAllMascotasAvisosAdmin() {
  const supabase = await sb()
  if (!supabase) {
    return [...mockMascotasAvisos].sort((a, b) => {
      const sa = ESTADO_SORT[a.estado] ?? 9
      const sb_ = ESTADO_SORT[b.estado] ?? 9
      if (sa !== sb_) return sa - sb_
      return new Date(b.creado_en) - new Date(a.creado_en)
    })
  }

  const { data, error } = await supabase
    .from('mascotas_avisos')
    .select(`${mascotaColumns}, resolve_token`)
    .order('creado_en', { ascending: false })

  if (error || !data) return []

  return [...data].sort((a, b) => {
    const sa = ESTADO_SORT[a.estado] ?? 9
    const sb_ = ESTADO_SORT[b.estado] ?? 9
    if (sa !== sb_) return sa - sb_
    return new Date(b.creado_en) - new Date(a.creado_en)
  })
}

export async function getPageViewsAdminSummary() {
  const supabase = await sb()
  if (!supabase) {
    return [
      {
        entity_type: 'negocio',
        entity_id: 'n-katem',
        entity_slug: 'katem',
        entity_title: 'Katem',
        total: 42,
        last7: 12,
      },
      {
        entity_type: 'mascota',
        entity_id: 'm1',
        entity_slug: 'luna-labrador-perdida-pilar-centro',
        entity_title: 'Luna, labrador chocolate',
        total: 18,
        last7: 18,
      },
    ]
  }

  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { data, error } = await supabase
    .from('page_views')
    .select('entity_type, entity_id, entity_slug, entity_title, creado_en')
    .order('creado_en', { ascending: false })
    .limit(5000)

  if (error || !data) return []

  const map = new Map()
  for (const row of data) {
    const key = `${row.entity_type}:${row.entity_id}`
    if (!map.has(key)) {
      map.set(key, {
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        entity_slug: row.entity_slug,
        entity_title: row.entity_title,
        total: 0,
        last7: 0,
      })
    }
    const entry = map.get(key)
    entry.total += 1
    if (new Date(row.creado_en) >= since) entry.last7 += 1
    if (row.entity_title) entry.entity_title = row.entity_title
    if (row.entity_slug) entry.entity_slug = row.entity_slug
  }

  return [...map.values()].sort((a, b) => b.total - a.total || b.last7 - a.last7)
}
