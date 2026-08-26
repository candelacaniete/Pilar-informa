import { createHash } from 'node:crypto'
import { COLFARMA_TURNO_URL } from './constants.js'
import { parseColfarmaTurnoHtml } from './parseTurnoHtml.js'

export function hashHtml(html) {
  return createHash('sha256').update(String(html || ''), 'utf8').digest('hex')
}

export async function fetchColfarmaTurnoHtml({
  url = COLFARMA_TURNO_URL,
  fetchImpl = fetch,
  signal,
} = {}) {
  const res = await fetchImpl(url, {
    signal,
    headers: {
      'User-Agent': 'GuiaPilarBot/1.0 (+https://pilara.info; farmacias-de-turno)',
      Accept: 'text/html,application/xhtml+xml',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Colfarma respondió HTTP ${res.status}`)
  }
  return res.text()
}

/**
 * Ejecuta scrape + upsert en farmacias_turno (solo filas fuente=colfarma).
 * Requiere cliente con service role (bypassa RLS).
 */
export async function runFarmaciasTurnoScrape(supabase, options = {}) {
  const sourceUrl = options.url || COLFARMA_TURNO_URL
  const startedAt = new Date().toISOString()

  const { data: run, error: runErr } = await supabase
    .from('farmacias_scrape_runs')
    .insert({
      started_at: startedAt,
      source_url: sourceUrl,
      ok: null,
    })
    .select('id')
    .single()

  if (runErr || !run?.id) {
    throw new Error(runErr?.message || 'No se pudo crear farmacias_scrape_runs')
  }

  const runId = run.id

  try {
    const html = options.html != null ? options.html : await fetchColfarmaTurnoHtml({ url: sourceUrl })
    const htmlHash = hashHtml(html)
    const { farmacias, fechas, count } = parseColfarmaTurnoHtml(html, { now: options.now })

    for (const fecha of fechas) {
      const { error: delErr } = await supabase
        .from('farmacias_turno')
        .delete()
        .eq('fuente', 'colfarma')
        .eq('fecha', fecha)
      if (delErr) throw new Error(`No se pudieron limpiar turnos colfarma del ${fecha}: ${delErr.message}`)
    }

    const rows = farmacias.map((f) => ({
      nombre: f.nombre,
      direccion: f.direccion,
      localidad: f.localidad,
      telefono: f.telefono,
      whatsapp: null,
      fecha: f.fecha,
      horario: f.horario,
      notas: f.notas,
      turno_desde: f.turno_desde,
      turno_hasta: f.turno_hasta,
      maps_url: f.maps_url,
      fuente: 'colfarma',
      scrape_run_id: runId,
    }))

    const { error: insErr } = await supabase.from('farmacias_turno').insert(rows)
    if (insErr) throw new Error(`No se pudieron insertar turnos: ${insErr.message}`)

    const finishedAt = new Date().toISOString()
    await supabase
      .from('farmacias_scrape_runs')
      .update({
        finished_at: finishedAt,
        ok: true,
        farmacias_count: count,
        fechas,
        html_hash: htmlHash,
        error_message: null,
      })
      .eq('id', runId)

    return { ok: true, runId, count, fechas, htmlHash }
  } catch (err) {
    const message = err?.message || String(err)
    await supabase
      .from('farmacias_scrape_runs')
      .update({
        finished_at: new Date().toISOString(),
        ok: false,
        farmacias_count: 0,
        error_message: message.slice(0, 2000),
      })
      .eq('id', runId)

    return { ok: false, runId, error: message }
  }
}
