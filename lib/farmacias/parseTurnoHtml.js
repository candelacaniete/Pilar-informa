const MONTHS = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
}

const TURNO_RE =
  /Turno comenzado el\s+(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+a las\s+(\d{1,2}):(\d{2})\s*hs?\.?\s*Finaliza el\s+(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+a las\s+(\d{1,2}):(\d{2})/i

function decodeEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function stripTags(html) {
  return decodeEntities(String(html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function yearInPilar(now = new Date()) {
  return Number(
    now.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).slice(0, 4),
  )
}

/**
 * Construye ISO local AR (sin offset) → timestamptz vía `America/Argentina/Buenos_Aires`.
 * Guardamos como string `YYYY-MM-DDTHH:mm:ss-03:00` (AR no usa DST).
 */
function toArTimestamptz(year, month, day, hour, minute) {
  return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00-03:00`
}

export function parseTurnoTexto(texto, { year } = {}) {
  const y = year || yearInPilar()
  const match = String(texto || '').match(TURNO_RE)
  if (!match) return null

  const [, d1, m1, h1, min1, d2, m2, h2, min2] = match
  const monthStart = MONTHS[m1.toLowerCase()]
  const monthEnd = MONTHS[m2.toLowerCase()]
  if (!monthStart || !monthEnd) return null

  let yearStart = y
  let yearEnd = y
  // Cruce de año: empezó en diciembre y termina en enero
  if (monthStart === 12 && monthEnd === 1) yearEnd = y + 1
  if (monthStart === 1 && monthEnd === 12) yearStart = y - 1

  const turno_desde = toArTimestamptz(yearStart, monthStart, Number(d1), Number(h1), Number(min1))
  const turno_hasta = toArTimestamptz(yearEnd, monthEnd, Number(d2), Number(h2), Number(min2))
  const fecha = `${yearStart}-${pad2(monthStart)}-${pad2(d1)}`
  const horario = `${pad2(h1)}:${pad2(min1)} a ${pad2(h2)}:${pad2(min2)} (día siguiente)`

  return {
    fecha,
    turno_desde,
    turno_hasta,
    horario,
    turno_texto: decodeEntities(texto).replace(/\s+/g, ' ').trim(),
  }
}

function parseAddressPhone(blockHtml) {
  const pMatch = blockHtml.match(/<h3[^>]*>[\s\S]*?<\/h3>\s*<p>([\s\S]*?)<\/p>/i)
  if (!pMatch) return { direccion: null, telefono: null }
  const lines = stripTags(pMatch[1])
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const direccion = lines[0] || null
  const telefono = lines[1] || null
  return { direccion, telefono }
}

function parseCard(cardHtml, localidad, year) {
  const nameMatch = cardHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)
  if (!nameMatch) return null
  const nombre = stripTags(nameMatch[1])
  if (!nombre) return null

  const { direccion, telefono } = parseAddressPhone(cardHtml)

  const turnoMatch = cardHtml.match(
    /Turno comenzado el\s+\d{1,2}\s+de\s+[a-záéíóúñ]+\s+a las\s+\d{1,2}:\d{2}\s*hs?\.?\s*Finaliza el\s+\d{1,2}\s+de\s+[a-záéíóúñ]+\s+a las\s+\d{1,2}:\d{2}\s*hs?\.?/i,
  )
  const turno = parseTurnoTexto(turnoMatch?.[0] || '', { year })
  if (!turno) return null

  const mapsMatch = cardHtml.match(/href=['"](https?:\/\/(?:www\.)?google\.com\/maps[^'"]+)['"]/i)
  const maps_url = mapsMatch ? decodeEntities(mapsMatch[1]) : null

  return {
    nombre,
    direccion,
    telefono,
    localidad,
    maps_url,
    fecha: turno.fecha,
    turno_desde: turno.turno_desde,
    turno_hasta: turno.turno_hasta,
    horario: turno.horario,
    notas: turno.turno_texto,
    fuente: 'colfarma',
  }
}

/**
 * Parsea el HTML de https://colfarma.info/pilar/farmacias-de-turno/
 * Soporta varias farmacias por localidad (ej. Villa Rosa ×2).
 */
export function parseColfarmaTurnoHtml(html, { now = new Date() } = {}) {
  if (!html || typeof html !== 'string') {
    throw new Error('HTML vacío o inválido')
  }

  const year = yearInPilar(now)
  const gridMatch = html.match(/<div class=["']colfarma-grid["'][\s\S]*$/i)
  const body = gridMatch ? gridMatch[0] : html

  const sectionRe = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2\b|<\/div>\s*$)/gi
  const farmacias = []
  let section

  while ((section = sectionRe.exec(body)) !== null) {
    const localidad = stripTags(section[1])
    const sectionHtml = section[2]
    const cardRe =
      /<div style=['"]border:1px solid #ddd[\s\S]*?<\/a>\s*<\/div>\s*<\/div>/gi
    let card
    let found = 0
    while ((card = cardRe.exec(sectionHtml)) !== null) {
      const parsed = parseCard(card[0], localidad, year)
      if (parsed) {
        farmacias.push(parsed)
        found += 1
      }
    }
    // Fallback: cards por <h3> si el estilo cambia
    if (!found) {
      const h3Re = /<h3[^>]*>[\s\S]*?(?=<h3\b|$)/gi
      let chunk
      while ((chunk = h3Re.exec(sectionHtml)) !== null) {
        const parsed = parseCard(chunk[0], localidad, year)
        if (parsed) farmacias.push(parsed)
      }
    }
  }

  if (!farmacias.length) {
    throw new Error('No se encontraron farmacias de turno en el HTML de Colfarma')
  }

  const fechas = [...new Set(farmacias.map((f) => f.fecha))].sort()
  return { farmacias, fechas, count: farmacias.length }
}
