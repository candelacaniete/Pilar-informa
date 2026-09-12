import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CSV_COLUMNS = [
  'score',
  'scoreBand',
  'businessName',
  'ownerName',
  'businessPhoneRaw',
  'businessPhoneE164',
  'businessPhoneKind',
  'businessWhatsappLink',
  'ownerPhone',
  'ownerPhoneKind',
  'emails',
  'instagram',
  'address',
  'localidadHint',
  'rating',
  'reviewCount',
  'website',
  'mapsUrl',
  'types',
  'businessStatus',
  'sourceQueries',
  'ownerSource',
  'enrichmentNotes',
  'scoreReasons',
  'msgWhatsapp',
  'msgEmailSubject',
  'msgEmailBody',
  'placeId',
  'lat',
  'lng',
  'clientId',
]

function csvEscape(value) {
  if (value == null) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCsv(leads, columns = CSV_COLUMNS) {
  const header = columns.join(',')
  const rows = leads.map((lead) => columns.map((col) => csvEscape(lead[col])).join(','))
  return [header, ...rows].join('\n') + '\n'
}

export async function writeExports({ outDir, stamp, clientId, leads, meta }) {
  await mkdir(outDir, { recursive: true })
  const base = `${clientId}_${stamp}`
  const jsonPath = path.join(outDir, `${base}.json`)
  const csvPath = path.join(outDir, `${base}.csv`)
  const hotPath = path.join(outDir, `${base}_hot.csv`)

  const payload = {
    meta,
    leads,
  }

  await writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf8')
  await writeFile(csvPath, toCsv(leads), 'utf8')

  const hot = leads.filter((l) => l.scoreBand === 'hot' || l.scoreBand === 'warm')
  await writeFile(hotPath, toCsv(hot), 'utf8')

  return { jsonPath, csvPath, hotPath, total: leads.length, prioritized: hot.length }
}
