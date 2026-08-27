import { ZONAS_PILAR } from '@/lib/zonas'
import { addDaysIso, horariosTexto, todayInPilar } from '@/lib/utils'
import {
  getEventos,
  getFarmaciasScrapeStatus,
  getFarmaciasTurno,
  getNegociosActivos,
  getNoticias,
  getPromociones,
} from '@/lib/data'
import { COLFARMA_ATTRIBUTION, COLFARMA_TURNO_URL } from '@/lib/farmacias/constants'
import { detectIntent } from '@/lib/pilar/intent'
import { filterNegociosByCategoryIntent } from '@/lib/pilar/categoryFilters'

export { detectIntent } from '@/lib/pilar/intent'

export function detectZona(question) {
  const q = question.toLowerCase()
  return (
    ZONAS_PILAR.find((zona) => q.includes(zona.toLowerCase())) ||
    (q.includes('pilar') && q.includes('centro') ? 'Pilar Centro' : null)
  )
}

function compactNegocio(n) {
  return {
    nombre: n.nombre,
    categoria: n.categorias?.nombre || n.subcategoria,
    subcategoria: n.subcategoria || null,
    descripcion_corta: n.descripcion_corta || null,
    localidad: n.localidad,
    direccion: n.direccion,
    horarios: horariosTexto(n.horarios),
    telefono: n.telefono,
    whatsapp: n.whatsapp,
    slug: n.slug,
  }
}

export async function gatherPilarContext(question) {
  const today = todayInPilar()
  const weekEnd = addDaysIso(today, 6)
  const zona = detectZona(question)
  const intent = detectIntent(question)

  const [farmaciasHoy, farmaciasSemana, promociones, eventos, noticias, negocios, scrape] =
    await Promise.all([
      getFarmaciasTurno({ fromDate: today, toDate: today, localidad: zona || undefined }),
      getFarmaciasTurno({ fromDate: today, toDate: weekEnd, localidad: zona || undefined }),
      getPromociones({ limit: 8 }),
      getEventos({ fromToday: true, limit: 8 }),
      getNoticias({ limit: 4 }),
      getNegociosActivos({ limit: 20 }),
      getFarmaciasScrapeStatus(),
    ])

  let negociosFiltrados = negocios
  if (zona) {
    const z = zona.toLowerCase()
    negociosFiltrados = negocios.filter((n) => (n.localidad || '').toLowerCase().includes(z))
  }
  if (intent === 'gastro' || intent === 'mascotas') {
    negociosFiltrados = filterNegociosByCategoryIntent(negociosFiltrados, intent)
  }

  return {
    hoy: today,
    zonaDetectada: zona,
    intent,
    farmaciasFuente: COLFARMA_ATTRIBUTION,
    farmaciasOficialUrl: COLFARMA_TURNO_URL,
    farmaciasStale: Boolean(scrape.stale),
    farmaciasHoy: farmaciasHoy.map(
      ({ nombre, direccion, localidad, telefono, horario, notas, maps_url }) => ({
        nombre,
        direccion,
        localidad,
        telefono,
        horario,
        notas,
        maps_url: maps_url || null,
      }),
    ),
    farmaciasSemana: farmaciasSemana.slice(0, 12).map(({ nombre, localidad, fecha, horario }) => ({
      nombre,
      localidad,
      fecha,
      horario,
    })),
    promociones: promociones.map((p) => ({
      titulo: p.titulo,
      descuento: p.descuento,
      descripcion: p.descripcion,
      negocio: p.negocios?.nombre,
      hasta: p.valido_hasta,
    })),
    eventos: eventos.map((e) => ({
      titulo: e.titulo,
      fecha: e.fecha,
      hora: e.hora,
      ubicacion: e.ubicacion,
      localidad: e.localidad,
      descripcion: e.descripcion,
    })),
    noticias: noticias.map((n) => ({ titulo: n.titulo, bajada: n.bajada, categoria: n.categoria })),
    negocios: negociosFiltrados.slice(0, 8).map(compactNegocio),
  }
}
