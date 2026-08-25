import {
  BANNER_PRECIO_CATEGORIA_ARS,
  BANNER_PRECIO_HOME_ARS,
  BANNER_SLOTS_CATEGORIA,
  BANNER_SLOTS_HOME,
  currentMonthStart,
} from '@/lib/banners'
import {
  mockBanners,
  mockCategorias,
  mockNegocios,
  mockResenas,
} from '@/lib/mock/data'
import { createClient } from '@/lib/supabase/server'
import { daysUntil, todayInPilar } from '@/lib/utils'
import { FUENTE_ALTA_OPTIONS, PLAN_PRICES_ARS, fuenteAltaLabel, planPriceArs } from '@/lib/metrics/config'

function monthStartFromDate(isoDate) {
  return `${isoDate.slice(0, 7)}-01`
}

function nextMonthStart(monthStart) {
  const [y, m] = monthStart.split('-').map(Number)
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)
}

function isInCurrentMonth(iso, monthStart) {
  if (!iso) return false
  return monthStartFromDate(String(iso)) === monthStart
}

function initPlanCounts() {
  return { basico: 0, destacado: 0, premium: 0 }
}

function buildPlanBreakdown(rows = []) {
  const counts = initPlanCounts()
  for (const row of rows) {
    if (counts[row.plan] !== undefined) counts[row.plan] += 1
  }
  return counts
}

function buildCategoryBreakdown(negocios = [], categorias = []) {
  const counts = new Map(categorias.map((c) => [c.id, { ...c, activos: 0 }]))
  for (const n of negocios) {
    if (n.estado !== 'activo') continue
    const entry = counts.get(n.categoria_id)
    if (entry) entry.activos += 1
  }
  return [...counts.values()].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
}

function estimatePlanRevenue(planCounts) {
  return Object.entries(planCounts).reduce(
    (sum, [plan, count]) => sum + planPriceArs(plan) * count,
    0,
  )
}

function planMix(planCounts) {
  const total = Object.values(planCounts).reduce((s, n) => s + n, 0)
  if (!total) {
    return { basico: 0, destacado: 0, premium: 0, total: 0, weightedAvg: 0 }
  }
  const mix = {
    basico: planCounts.basico / total,
    destacado: planCounts.destacado / total,
    premium: planCounts.premium / total,
  }
  const weightedAvg = Object.entries(mix).reduce(
    (sum, [plan, pct]) => sum + pct * planPriceArs(plan),
    0,
  )
  return { ...mix, total, weightedAvg }
}

function buildFuenteBreakdown(negocios = [], monthStart) {
  const counts = { sin_registrar: 0 }
  for (const opt of FUENTE_ALTA_OPTIONS) counts[opt.value] = 0

  for (const n of negocios) {
    if (!isInCurrentMonth(n.creado_en, monthStart)) continue
    const key = n.fuente_alta || 'sin_registrar'
    counts[key] = (counts[key] || 0) + 1
  }

  const rows = [
    ...FUENTE_ALTA_OPTIONS.map((o) => ({
      fuente: o.value,
      label: o.label,
      count: counts[o.value] || 0,
    })),
    {
      fuente: null,
      label: fuenteAltaLabel(null),
      count: counts.sin_registrar || 0,
    },
  ]
  return rows
}

function buildRenovacion(eventos = []) {
  let renovaciones = 0
  let bajas = 0
  for (const e of eventos) {
    if (e.tipo_evento === 'renovacion') renovaciones += 1
    if (e.tipo_evento === 'baja') bajas += 1
  }
  const total = renovaciones + bajas
  if (!total) {
    return { renovaciones: 0, bajas: 0, tasaPct: null, sinDatos: true }
  }
  return {
    renovaciones,
    bajas,
    tasaPct: Math.round((renovaciones / total) * 1000) / 10,
    sinDatos: false,
  }
}

function buildMetasProgress(metas = [], activos) {
  const today = todayInPilar()
  return metas
    .filter((m) => m.activo && m.desde <= today && m.hasta >= today)
    .map((m) => {
      const objetivo = Number(m.valor_objetivo) || 0
      const pct = objetivo > 0 ? Math.min(100, Math.round((activos / objetivo) * 1000) / 10) : 0
      return {
        id: m.id,
        periodo: m.periodo,
        tipo: m.tipo,
        objetivo,
        actual: activos,
        pct,
        desde: m.desde,
        hasta: m.hasta,
        notas: m.notas || null,
      }
    })
}

function buildProyeccion({ real, proyectadoRow }) {
  const proyectado = proyectadoRow ? Number(proyectadoRow.monto_ars) : null
  if (proyectado == null) {
    return {
      real,
      proyectado: null,
      delta: null,
      deltaPct: null,
      notas: null,
      sinProyeccion: true,
    }
  }
  const delta = real - proyectado
  const deltaPct = proyectado > 0 ? Math.round((delta / proyectado) * 1000) / 10 : null
  return {
    real,
    proyectado,
    delta,
    deltaPct,
    notas: proyectadoRow.notas || null,
    sinProyeccion: false,
  }
}

function buildActivityFeed({ negocios = [], resenas = [], banners = [] }) {
  const items = []

  negocios.forEach((n) => {
    items.push({
      id: `negocio-${n.id}`,
      type: 'negocio_alta',
      at: n.creado_en,
      title: n.nombre,
      detail: `Alta en plan ${n.plan || '—'}`,
    })
  })

  resenas.forEach((r) => {
    items.push({
      id: `resena-${r.id}`,
      type: 'resena',
      at: r.creado_en,
      title: r.negocios?.nombre || 'Negocio',
      detail: `Reseña ${r.calificacion}★`,
    })
  })

  banners.forEach((b) => {
    items.push({
      id: `banner-${b.id}`,
      type: 'banner',
      at: b.creado_en,
      title: b.titulo || 'Banner',
      detail:
        b.ubicacion === 'home'
          ? `Home · slot ${b.slot}`
          : `${b.categorias?.nombre || 'Categoría'} · slot ${b.slot}`,
    })
  })

  return items
    .filter((i) => i.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 15)
}

function summarizeNegocios(rows) {
  const activos = rows.filter((n) => n.estado === 'activo').length
  const porVencerSemana = rows.filter((n) => {
    const d = daysUntil(n.plan_vence)
    return d !== null && d >= 0 && d <= 7
  }).length
  const porVencerMes = rows.filter((n) => {
    const d = daysUntil(n.plan_vence)
    return d !== null && d >= 0 && d <= 30
  }).length
  const vencidos = rows.filter((n) => n.estado === 'vencido' || daysUntil(n.plan_vence) < 0).length
  return { activos, porVencerSemana, porVencerMes, vencidos }
}

function assembleMetrics(payload) {
  const { porPlanActivos, porCategoria, resenas, banners, calculator } = payload
  const activos = payload.negociosCards.activos
  const homePct = banners.home.total
    ? Math.round((banners.home.ocupados / banners.home.total) * 100)
    : 0
  const catPct = banners.categorias.total
    ? Math.round((banners.categorias.ocupados / banners.categorias.total) * 100)
    : 0

  const proyeccion = payload.proyeccion
  const renovacion = payload.renovacion
  const pilar = payload.pilar
  const metas = payload.metas || []
  const fuentesAlta = payload.fuentesAlta || []

  return {
    usingMock: payload.usingMock,
    monthStart: payload.monthStart,
    monthLabel: new Intl.DateTimeFormat('es-AR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date(`${payload.monthStart}T12:00:00`)),
    operational: {
      negocios: {
        ...payload.negociosCards,
        porPlan: porPlanActivos,
        porCategoria,
      },
      resenas,
      banners,
      actividad: payload.actividad,
      proyeccion,
      renovacion,
      pilar,
      metas,
      fuentesAlta,
    },
    sales: {
      negocios: {
        activos,
        porPlan: porPlanActivos,
        categoriasConNegocios: porCategoria.filter((c) => c.activos > 0).length,
        categoriasVacias: porCategoria.filter((c) => c.activos === 0).length,
      },
      resenas: {
        nuevasMes: resenas.nuevasMes,
        promedio: resenas.promedio,
      },
      banners: {
        homePct,
        categoriasPct: catPct,
        ocupacionLabel: `${banners.home.ocupados}/${banners.home.total} home · ${banners.categorias.ocupados}/${banners.categorias.total} categorías`,
      },
      proyeccion: {
        real: proyeccion.real,
        proyectado: proyeccion.proyectado,
        deltaPct: proyeccion.deltaPct,
        sinProyeccion: proyeccion.sinProyeccion,
      },
      renovacion: {
        tasaPct: renovacion.sinDatos ? null : renovacion.tasaPct,
        sinDatos: renovacion.sinDatos,
      },
      pilar,
      metas: metas.map((m) => ({
        id: m.id,
        tipo: m.tipo,
        periodo: m.periodo,
        objetivo: m.objetivo,
        actual: m.actual,
        pct: m.pct,
      })),
    },
    calculator: {
      ...calculator,
    },
    // Listas para editores (admin)
    proyeccionesList: payload.proyeccionesList || [],
    metasList: payload.metasList || [],
    schemaFlags: payload.schemaFlags || {
      fuenteAltaReady: false,
      proyeccionReady: false,
      metasReady: false,
      eventosReady: false,
      pilarReady: false,
    },
  }
}

function mockPhase2Extras(activos, ingresosPlanes, ingresosBanners) {
  const real = ingresosPlanes + ingresosBanners
  return {
    proyeccion: buildProyeccion({
      real,
      proyectadoRow: { monto_ars: 484500, notas: 'Demo' },
    }),
    renovacion: { renovaciones: 0, bajas: 0, tasaPct: null, sinDatos: true },
    pilar: { consultas: 0, usuariosUnicos: 0 },
    metas: [
      {
        id: 'mock-q4',
        periodo: '2026-Q4',
        tipo: 'trimestral',
        objetivo: 44,
        actual: activos,
        pct: Math.min(100, Math.round((activos / 44) * 1000) / 10),
        desde: '2026-10-01',
        hasta: '2026-12-31',
        notas: null,
      },
      {
        id: 'mock-h2',
        periodo: '2026-H2',
        tipo: 'semestral',
        objetivo: 68,
        actual: activos,
        pct: Math.min(100, Math.round((activos / 68) * 1000) / 10),
        desde: '2026-09-01',
        hasta: '2027-02-28',
        notas: null,
      },
    ],
    fuentesAlta: [
      ...FUENTE_ALTA_OPTIONS.map((o) => ({ fuente: o.value, label: o.label, count: 0 })),
      { fuente: null, label: 'Sin registrar', count: mockNegocios.filter((n) => n.estado === 'activo').length },
    ],
    proyeccionesList: [],
    metasList: [],
  }
}

function mockMetrics() {
  const monthStart = currentMonthStart()
  const activosRows = mockNegocios.filter((n) => n.estado === 'activo')
  const allRows = mockNegocios
  const porPlanActivos = buildPlanBreakdown(activosRows)
  const categorias = mockCategorias
  const porCategoria = buildCategoryBreakdown(allRows, categorias)
  const monthResenas = mockResenas.filter(
    (r) => r.estado === 'publicada' && isInCurrentMonth(r.creado_en, monthStart),
  )
  const avgRating =
    mockResenas.filter((r) => r.estado === 'publicada').length > 0
      ? mockResenas
          .filter((r) => r.estado === 'publicada')
          .reduce((s, r) => s + r.calificacion, 0) /
        mockResenas.filter((r) => r.estado === 'publicada').length
      : 0
  const withResena = new Set(
    mockResenas.filter((r) => r.estado === 'publicada').map((r) => r.negocio_id),
  )
  const sinResena = activosRows
    .filter((n) => !withResena.has(n.id))
    .map((n) => ({ id: n.id, nombre: n.nombre, slug: n.slug }))

  const bannersMes = mockBanners.filter((b) => b.mes === monthStart && b.activo)
  const homeOcupados = bannersMes.filter((b) => b.ubicacion === 'home').length
  const catBanners = bannersMes.filter((b) => b.ubicacion === 'categoria')
  const categoriasAbiertas = categorias.filter((c) => !c.cerrada)
  const catSlotsTotal = categoriasAbiertas.length * BANNER_SLOTS_CATEGORIA
  const ingresosBanners = bannersMes.reduce((s, b) => s + (b.precio_ars || 0), 0)
  const ingresosPlanes = estimatePlanRevenue(porPlanActivos)
  const mix = planMix(porPlanActivos)
  const negociosCards = summarizeNegocios(allRows)
  const phase2 = mockPhase2Extras(negociosCards.activos, ingresosPlanes, ingresosBanners)

  const porCategoriaBanner = categoriasAbiertas.map((c) => {
    const ocupados = catBanners.filter((b) => b.categoria_id === c.id).length
    return {
      id: c.id,
      nombre: c.nombre,
      slug: c.slug,
      ocupados,
      total: BANNER_SLOTS_CATEGORIA,
    }
  })

  return assembleMetrics({
    usingMock: true,
    monthStart,
    negociosCards,
    porPlanActivos,
    porCategoria,
    resenas: {
      nuevasMes: monthResenas.length,
      promedio: avgRating,
      sinResena,
    },
    banners: {
      home: { ocupados: homeOcupados, total: BANNER_SLOTS_HOME },
      categorias: { ocupados: catBanners.length, total: catSlotsTotal },
      porCategoria: porCategoriaBanner,
      ingresosMes: ingresosBanners,
    },
    actividad: buildActivityFeed({
      negocios: mockNegocios.slice(0, 6),
      resenas: mockResenas,
      banners: bannersMes,
    }),
    calculator: {
      planPrices: PLAN_PRICES_ARS,
      mix,
      ingresosPlanesActivos: ingresosPlanes,
      ingresosBannersMes: ingresosBanners,
      totalEstimadoMes: ingresosPlanes + ingresosBanners,
    },
    ...phase2,
    schemaFlags: {
      fuenteAltaReady: false,
      proyeccionReady: false,
      metasReady: false,
      eventosReady: false,
      pilarReady: false,
    },
  })
}

export async function getAdminMetricsPhase1() {
  return getAdminMetrics()
}

function logQueryError(label, error) {
  if (!error) return
  console.error(`[metrics] ${label}:`, error.message || error)
}

function isMissingRelationOrColumn(error) {
  const msg = String(error?.message || error?.details || '').toLowerCase()
  const code = String(error?.code || '')
  return (
    code === '42703' ||
    code === '42P01' ||
    code === 'PGRST202' ||
    code === 'PGRST204' ||
    msg.includes('does not exist') ||
    msg.includes('could not find') ||
    msg.includes('schema cache')
  )
}

/** Negocios para métricas: columnas base (sin depender de mig 011). */
async function fetchNegociosForMetrics(supabase) {
  const base = await supabase
    .from('negocios')
    .select('id, nombre, slug, categoria_id, plan, estado, plan_vence, creado_en')

  if (base.error) {
    logQueryError('negocios (base)', base.error)
    return { data: [], error: base.error }
  }

  // Intento opcional de enriquecer con fuente_alta (mig 011). Si falla, seguimos.
  const withFuente = await supabase
    .from('negocios')
    .select('id, fuente_alta')

  if (withFuente.error) {
    if (!isMissingRelationOrColumn(withFuente.error)) {
      logQueryError('negocios.fuente_alta (opcional)', withFuente.error)
    }
    return { data: base.data || [], error: null, fuenteAltaReady: false }
  }

  const byId = new Map((withFuente.data || []).map((r) => [r.id, r.fuente_alta]))
  const merged = (base.data || []).map((n) => ({
    ...n,
    fuente_alta: byId.has(n.id) ? byId.get(n.id) : null,
  }))
  return { data: merged, error: null, fuenteAltaReady: true }
}

/** Categorías: select('*') como getCategorias, sin exigir columna cerrada. */
async function fetchCategoriasForMetrics(supabase) {
  const res = await supabase.from('categorias').select('*').order('orden')
  if (res.error) {
    logQueryError('categorias', res.error)
    return { data: [], error: res.error }
  }
  const normalized = (res.data || []).map((c) => ({
    ...c,
    cerrada: Boolean(c.cerrada) || c.slug === 'tecnologia',
  }))
  return { data: normalized, error: null }
}

/** Queries Fase 2: si la tabla/RPC no existe, degradar sin tumbar el dashboard. */
async function fetchOptional(label, promise) {
  const res = await promise
  if (res?.error) {
    if (isMissingRelationOrColumn(res.error)) {
      console.warn(`[metrics] ${label}: aún no disponible (${res.error.message})`)
    } else {
      logQueryError(label, res.error)
    }
    return { data: null, error: res.error, unavailable: true }
  }
  return { data: res.data, error: null, unavailable: false, count: res.count }
}

export async function getAdminMetrics() {
  const supabase = await createClient()
  if (!supabase) return mockMetrics()

  const monthStart = currentMonthStart()
  const monthStartTs = `${monthStart}T00:00:00`
  const monthEndExclusive = `${nextMonthStart(monthStart)}T00:00:00`

  const [
    negociosPack,
    categoriasPack,
    resenasRes,
    resenasMesRes,
    bannersRes,
    actividadNegociosRes,
    actividadResenasRes,
    actividadBannersRes,
    proyeccionMesPack,
    proyeccionesListPack,
    metasPack,
    metasAllPack,
    eventosPack,
    pilarPack,
  ] = await Promise.all([
    fetchNegociosForMetrics(supabase),
    fetchCategoriasForMetrics(supabase),
    supabase.from('resenas').select('id, negocio_id, calificacion, estado, creado_en').eq('estado', 'publicada'),
    supabase
      .from('resenas')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'publicada')
      .gte('creado_en', monthStartTs),
    supabase
      .from('banners')
      .select(
        'id, ubicacion, categoria_id, slot, mes, titulo, precio_ars, activo, creado_en, categorias ( id, nombre, slug )',
      )
      .eq('mes', monthStart)
      .eq('activo', true),
    supabase
      .from('negocios')
      .select('id, nombre, slug, plan, creado_en')
      .order('creado_en', { ascending: false })
      .limit(8),
    supabase
      .from('resenas')
      .select('id, calificacion, creado_en, negocios ( nombre )')
      .order('creado_en', { ascending: false })
      .limit(8),
    supabase
      .from('banners')
      .select('id, ubicacion, slot, titulo, creado_en, categorias ( nombre )')
      .order('creado_en', { ascending: false })
      .limit(8),
    fetchOptional(
      'metricas_proyeccion (mes)',
      supabase.from('metricas_proyeccion').select('id, mes, monto_ars, notas').eq('mes', monthStart).maybeSingle(),
    ),
    fetchOptional(
      'metricas_proyeccion (lista)',
      supabase.from('metricas_proyeccion').select('id, mes, monto_ars, notas').order('mes', { ascending: true }),
    ),
    fetchOptional(
      'metricas_metas (activas)',
      supabase
        .from('metricas_metas')
        .select('id, periodo, tipo, valor_objetivo, desde, hasta, activo, notas')
        .eq('activo', true)
        .order('desde', { ascending: true }),
    ),
    fetchOptional(
      'metricas_metas (todas)',
      supabase
        .from('metricas_metas')
        .select('id, periodo, tipo, valor_objetivo, desde, hasta, activo, notas')
        .order('desde', { ascending: true }),
    ),
    fetchOptional(
      'negocio_eventos',
      supabase
        .from('negocio_eventos')
        .select('id, tipo_evento, fecha')
        .in('tipo_evento', ['renovacion', 'baja'])
        .gte('fecha', monthStartTs)
        .lt('fecha', monthEndExclusive),
    ),
    fetchOptional('pilar_stats_mes', supabase.rpc('pilar_stats_mes', { p_mes: monthStart })),
  ])

  if (resenasRes.error) logQueryError('resenas', resenasRes.error)
  if (resenasMesRes.error) logQueryError('resenas (mes)', resenasMesRes.error)
  if (bannersRes.error) logQueryError('banners', bannersRes.error)
  if (actividadNegociosRes.error) logQueryError('actividad negocios', actividadNegociosRes.error)
  if (actividadResenasRes.error) logQueryError('actividad resenas', actividadResenasRes.error)
  if (actividadBannersRes.error) logQueryError('actividad banners', actividadBannersRes.error)

  const negocios = negociosPack.data || []
  const categorias = categoriasPack.data || []
  const resenas = resenasRes.error ? [] : resenasRes.data || []
  const bannersMes = bannersRes.error ? [] : bannersRes.data || []
  const activosRows = negocios.filter((n) => n.estado === 'activo')
  const porPlanActivos = buildPlanBreakdown(activosRows)
  const porCategoria = buildCategoryBreakdown(negocios, categorias)
  const negociosCards = summarizeNegocios(negocios)

  const avgRating =
    resenas.length > 0
      ? resenas.reduce((s, r) => s + Number(r.calificacion), 0) / resenas.length
      : 0

  const resenaNegocioIds = new Set(resenas.map((r) => r.negocio_id))
  const sinResena = activosRows
    .filter((n) => !resenaNegocioIds.has(n.id))
    .map((n) => ({ id: n.id, nombre: n.nombre, slug: n.slug }))
    .slice(0, 20)

  const homeOcupados = bannersMes.filter((b) => b.ubicacion === 'home').length
  const catBanners = bannersMes.filter((b) => b.ubicacion === 'categoria')
  const categoriasAbiertas = categorias.filter((c) => !c.cerrada)
  const catSlotsTotal = categoriasAbiertas.length * BANNER_SLOTS_CATEGORIA
  const ingresosBanners = bannersMes.reduce((s, b) => s + Number(b.precio_ars || 0), 0)
  const ingresosPlanes = estimatePlanRevenue(porPlanActivos)
  const mix = planMix(porPlanActivos)
  const totalEstimadoMes = ingresosPlanes + ingresosBanners

  const porCategoriaBanner = categoriasAbiertas.map((c) => {
    const ocupados = catBanners.filter((b) => b.categoria_id === c.id).length
    return {
      id: c.id,
      nombre: c.nombre,
      slug: c.slug,
      ocupados,
      total: BANNER_SLOTS_CATEGORIA,
    }
  })

  const actividad = buildActivityFeed({
    negocios: actividadNegociosRes.error ? [] : actividadNegociosRes.data || [],
    resenas: actividadResenasRes.error ? [] : actividadResenasRes.data || [],
    banners: actividadBannersRes.error ? [] : actividadBannersRes.data || [],
  })

  const proyeccion = buildProyeccion({
    real: totalEstimadoMes,
    proyectadoRow: proyeccionMesPack.unavailable ? null : proyeccionMesPack.data,
  })

  const renovacion = buildRenovacion(eventosPack.unavailable ? [] : eventosPack.data || [])

  const pilarRows = Array.isArray(pilarPack.data) ? pilarPack.data : []
  const pilarRow = pilarPack.unavailable ? null : pilarRows[0]
  const pilar = {
    consultas: Number(pilarRow?.consultas || 0),
    usuariosUnicos: Number(pilarRow?.usuarios_unicos || 0),
  }

  const metas = buildMetasProgress(
    metasPack.unavailable ? [] : metasPack.data || [],
    negociosCards.activos,
  )
  const fuentesAlta = buildFuenteBreakdown(negocios, monthStart)

  return assembleMetrics({
    usingMock: false,
    monthStart,
    negociosCards,
    porPlanActivos,
    porCategoria,
    resenas: {
      nuevasMes: resenasMesRes.error ? 0 : resenasMesRes.count || 0,
      promedio: avgRating,
      sinResena,
    },
    banners: {
      home: { ocupados: homeOcupados, total: BANNER_SLOTS_HOME },
      categorias: { ocupados: catBanners.length, total: catSlotsTotal },
      porCategoria: porCategoriaBanner,
      ingresosMes: ingresosBanners,
      preciosReferencia: {
        home: BANNER_PRECIO_HOME_ARS,
        categoria: BANNER_PRECIO_CATEGORIA_ARS,
      },
    },
    actividad,
    calculator: {
      planPrices: PLAN_PRICES_ARS,
      mix,
      ingresosPlanesActivos: ingresosPlanes,
      ingresosBannersMes: ingresosBanners,
      totalEstimadoMes,
    },
    proyeccion,
    renovacion,
    pilar,
    metas,
    fuentesAlta,
    proyeccionesList: proyeccionesListPack.unavailable ? [] : proyeccionesListPack.data || [],
    metasList: metasAllPack.unavailable ? [] : metasAllPack.data || [],
    schemaFlags: {
      fuenteAltaReady: Boolean(negociosPack.fuenteAltaReady),
      proyeccionReady: !proyeccionMesPack.unavailable,
      metasReady: !metasPack.unavailable,
      eventosReady: !eventosPack.unavailable,
      pilarReady: !pilarPack.unavailable,
    },
  })
}
