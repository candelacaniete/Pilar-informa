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
import { daysUntil } from '@/lib/utils'
import { PLAN_PRICES_ARS, planPriceArs } from '@/lib/metrics/config'

function monthStartFromDate(isoDate) {
  return `${isoDate.slice(0, 7)}-01`
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
    negociosCards: summarizeNegocios(allRows),
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
  })
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
    },
    calculator: {
      ...calculator,
    },
  }
}

export async function getAdminMetricsPhase1() {
  const supabase = await createClient()
  if (!supabase) return mockMetrics()

  const monthStart = currentMonthStart()
  const monthStartTs = `${monthStart}T00:00:00`

  const [
    negociosRes,
    categoriasRes,
    resenasRes,
    resenasMesRes,
    bannersRes,
    actividadNegociosRes,
    actividadResenasRes,
    actividadBannersRes,
  ] = await Promise.all([
    supabase.from('negocios').select('id, nombre, slug, categoria_id, plan, estado, plan_vence, creado_en'),
    supabase.from('categorias').select('id, nombre, slug, icono, orden, cerrada').order('orden'),
    supabase.from('resenas').select('id, negocio_id, calificacion, estado, creado_en').eq('estado', 'publicada'),
    supabase
      .from('resenas')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'publicada')
      .gte('creado_en', monthStartTs),
    supabase
      .from('banners')
      .select('id, ubicacion, categoria_id, slot, mes, titulo, precio_ars, activo, creado_en, categorias ( id, nombre, slug )')
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
  ])

  const negocios = negociosRes.data || []
  const categorias = categoriasRes.data || []
  const resenas = resenasRes.data || []
  const bannersMes = bannersRes.data || []
  const activosRows = negocios.filter((n) => n.estado === 'activo')
  const porPlanActivos = buildPlanBreakdown(activosRows)
  const porCategoria = buildCategoryBreakdown(negocios, categorias)

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
    negocios: actividadNegociosRes.data || [],
    resenas: actividadResenasRes.data || [],
    banners: actividadBannersRes.data || [],
  })

  return assembleMetrics({
    usingMock: false,
    monthStart,
    negociosCards: summarizeNegocios(negocios),
    porPlanActivos,
    porCategoria,
    resenas: {
      nuevasMes: resenasMesRes.count || 0,
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
      totalEstimadoMes: ingresosPlanes + ingresosBanners,
    },
  })
}
