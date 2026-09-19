import { createHash } from 'node:crypto'
import { COLFARMA_TURNO_URL } from './constants.js'
import { parseColfarmaTurnoHtml } from './parseTurnoHtml.js'

export function hashHtml(html) {
  return createHash('sha256').update(String(html || ''), 'utf8').digest('hex')
}

function scrapeError(code, message, cause) {
  const err = new Error(`[${code}] ${message}`)
  err.code = code
  if (cause) err.cause = cause
  return err
}

export async function fetchColfarmaTurnoHtml({
  url = COLFARMA_TURNO_URL,
  fetchImpl = fetch,
  signal,
} = {}) {
  let res
  try {
    res = await fetchImpl(url, {
      signal,
      headers: {
        'User-Agent': 'GuiaPilarBot/1.0 (+https://pilara.info; farmacias-de-turno)',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
      redirect: 'follow',
    })
  } catch (err) {
    throw scrapeError(
      'SOURCE_UNREACHABLE',
      `No se pudo conectar a Colfarma (${url}): ${err?.message || err}`,
      err,
    )
  }

  if (!res.ok) {
    throw scrapeError(
      'SOURCE_HTTP',
      `Colfarma respondió HTTP ${res.status} (finalUrl=${res.url || url})`,
    )
  }

  const html = await res.text()
  if (!html || !String(html).trim()) {
    throw scrapeError('SOURCE_EMPTY', `Colfarma devolvió HTML vacío (HTTP ${res.status})`)
  }

  console.info('[farmacias-scrape] fetch ok', {
    status: res.status,
    finalUrl: res.url || url,
    bytes: html.length,
  })

  return html
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
    throw scrapeError(
      'PERSISTENCE',
      runErr?.message || 'No se pudo crear farmacias_scrape_runs',
      runErr,
    )
  }

  const runId = run.id

  try {
    const html = options.html != null ? options.html : await fetchColfarmaTurnoHtml({ url: sourceUrl })
    const htmlHash = hashHtml(html)

    let parsed
    try {
      parsed = parseColfarmaTurnoHtml(html, { now: options.now })
    } catch (err) {
      const code = err?.code || (/No se encontraron/i.test(err?.message || '') ? 'PARSE_EMPTY' : 'PARSE_INVALID')
      throw scrapeError(code, err?.message || String(err), err)
    }

    const { farmacias, fechas, count } = parsed

    console.info('[farmacias-scrape] parse ok', {
      runId,
      count,
      fechas,
      nombres: farmacias.map((f) => f.nombre),
    })

    for (const fecha of fechas) {
      const { error: delErr } = await supabase
        .from('farmacias_turno')
        .delete()
        .eq('fuente', 'colfarma')
        .eq('fecha', fecha)
      if (delErr) {
        throw scrapeError(
          'PERSISTENCE',
          `No se pudieron limpiar turnos colfarma del ${fecha}: ${delErr.message}`,
          delErr,
        )
      }
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
    if (insErr) {
      throw scrapeError('PERSISTENCE', `No se pudieron insertar turnos: ${insErr.message}`, insErr)
    }

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
    const code = err?.code || 'UNKNOWN'
    const message = err?.message || String(err)
    console.error('[farmacias-scrape] failed', { runId, code, message })
    await supabase
      .from('farmacias_scrape_runs')
      .update({
        finished_at: new Date().toISOString(),
        ok: false,
        farmacias_count: 0,
        error_message: message.slice(0, 2000),
      })
      .eq('id', runId)

    return { ok: false, runId, code, error: message }
  }
}
