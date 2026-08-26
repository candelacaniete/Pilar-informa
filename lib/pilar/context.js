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

export function detectZona(question) {
  const q = question.toLowerCase()
  return (
    ZONAS_PILAR.find((zona) => q.includes(zona.toLowerCase())) ||
    (q.includes('pilar') && q.includes('centro') ? 'Pilar Centro' : null)
  )
}

export function detectIntent(question) {
  const q = question.toLowerCase()
  if (/farmacia|turno|guardia/.test(q)) return 'farmacia'
  if (/promo|descuento|oferta|2x1|cup[oó]n/.test(q)) return 'promo'
  if (/evento|agenda|feria|festival|cine|qu[eé] hacer|finde|fin de semana/.test(q)) return 'evento'
  if (/noticia|pas[oó]|tr[aá]nsito|obras/.test(q)) return 'noticia'
  if (/restau|comer|parrilla|caf[eé]|bar|gastronom|pizza|almorz|cenar|brunch/.test(q)) return 'gastro'
  if (/pelu|belleza|est[eé]tica/.test(q)) return 'negocio'
  if (/vet|mascota|perro|gato/.test(q)) return 'negocio'
  if (/mecan|taller|auto/.test(q)) return 'negocio'
  if (/local|negocio|comercio|d[oó]nde|donde/.test(q)) return 'negocio'
  return 'general'
}

function compactNegocio(n) {
  return {
    nombre: n.nombre,
    categoria: n.categorias?.nombre || n.subcategoria,
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
  if (intent === 'gastro') {
    negociosFiltrados = negociosFiltrados.filter(
      (n) =>
        n.categorias?.slug === 'gastronomia' ||
        /gastro|restau|caf|parrilla|bar/i.test(`${n.subcategoria} ${n.nombre}`),
    )
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
