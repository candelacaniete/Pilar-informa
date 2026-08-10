import { createClient } from '@/lib/supabase/server'
import {
  mockCategorias,
  mockEventos,
  mockNegocios,
  mockNoticias,
  mockPromociones,
} from '@/lib/mock/data'
import { daysUntil, sortNegocios } from '@/lib/utils'

const negocioSelect = `
  *,
  categorias ( id, nombre, slug, icono ),
  negocio_fotos ( id, url, orden, es_principal )
`

async function sb() {
  return createClient()
}

export async function getCategorias() {
  const supabase = await sb()
  if (!supabase) return mockCategorias
  const { data, error } = await supabase.from('categorias').select('*').order('orden')
  if (error || !data?.length) return mockCategorias
  return data
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
    .select(negocioSelect)
    .eq('estado', 'activo')
    .order('prioridad', { ascending: true })
    .order('nombre', { ascending: true })

  if (categoriaSlug) {
    const cat = await getCategoriaBySlug(categoriaSlug)
    if (cat) query = query.eq('categoria_id', cat.id)
  }
  if (limit) query = query.limit(limit * 3) // fetch extra then sort by plan+prioridad client-side

  const { data, error } = await query
  if (error || !data) return []
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
    .select(negocioSelect)
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
    .select(negocioSelect)
    .order('prioridad', { ascending: true })
  if (error || !data) return []
  return sortNegocios(data)
}

export async function getNegocioAdminById(id) {
  const supabase = await sb()
  if (!supabase) return mockNegocios.find((n) => n.id === id) || null
  const { data, error } = await supabase
    .from('negocios')
    .select(negocioSelect)
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
