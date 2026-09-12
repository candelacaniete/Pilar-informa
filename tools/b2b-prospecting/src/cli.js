#!/usr/bin/env node
/**
 * CLI de prospección B2B (piloto Guía Pilar).
 *
 * Uso:
 *   node tools/b2b-prospecting/src/cli.js --client guia-pilar --dry-run
 *   node tools/b2b-prospecting/src/cli.js --client guia-pilar --max-queries 3
 *
 * Env:
 *   GOOGLE_PLACES_API_KEY  (requerida salvo --dry-run)
 *   GEMINI_API_KEY         (opcional, con --llm)
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { harvestPlaces } from './places.js'
import { enrichLeads } from './enrich.js'
import { buildLead, scoreLead } from './score.js'
import { attachMessages, craftWhatsappWithLlm } from './messages.js'
import { writeExports } from './export.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function parseArgs(argv) {
  const args = {
    client: 'guia-pilar',
    dryRun: false,
    enrich: true,
    details: false,
    llm: false,
    maxQueries: null,
    maxPages: 1,
    outDir: path.join(ROOT, 'exports'),
  }

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--client') args.client = argv[++i]
    else if (a === '--dry-run') args.dryRun = true
    else if (a === '--no-enrich') args.enrich = false
    else if (a === '--details') args.details = true
    else if (a === '--llm') args.llm = true
    else if (a === '--max-queries') args.maxQueries = Number(argv[++i])
    else if (a === '--max-pages') args.maxPages = Number(argv[++i])
    else if (a === '--out') args.outDir = path.resolve(argv[++i])
    else if (a === '--help' || a === '-h') args.help = true
  }
  return args
}

function printHelp() {
  console.log(`Prospección B2B — export CSV/JSON (no UI)

  node tools/b2b-prospecting/src/cli.js [opciones]

  --client guia-pilar   Cliente ICP (JSON en clients/)
  --dry-run             Usa fixtures, sin llamar a Google
  --details             Pide Place Details extra (más costo API)
  --no-enrich           No visita websites
  --llm                 Reescribe WhatsApp con Gemini si hay GEMINI_API_KEY
  --max-queries N       Limita cantidad de búsquedas
  --max-pages N         Páginas por query (default 1)
  --out DIR             Carpeta de export (default tools/b2b-prospecting/exports)

Salida: JSON completo + CSV all + CSV hot/warm priorizados.
`)
}

async function loadClient(id) {
  const file = path.join(ROOT, 'clients', `${id}.json`)
  const raw = await readFile(file, 'utf8')
  return JSON.parse(raw)
}

async function loadFixturePlaces() {
  const file = path.join(ROOT, 'fixtures', 'sample-places.json')
  const raw = await readFile(file, 'utf8')
  return JSON.parse(raw)
}

function stampNow() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const client = await loadClient(args.client)
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || ''
  const geminiKey = process.env.GEMINI_API_KEY || ''

  let places
  if (args.dryRun) {
    console.log('[dry-run] cargando fixtures…')
    places = await loadFixturePlaces()
  } else {
    if (!apiKey) {
      console.error('Falta GOOGLE_PLACES_API_KEY (o usá --dry-run).')
      process.exitCode = 1
      return
    }
    let queries = client.queries
    if (args.maxQueries != null) queries = queries.slice(0, args.maxQueries)
    places = await harvestPlaces(client, {
      apiKey,
      queries,
      maxPagesPerQuery: args.maxPages,
      enrichDetails: args.details,
      onProgress: (p) => {
        if (p.phase === 'search') console.log(`  search: ${p.query} (p${p.page})`)
        if (p.phase === 'details') console.log(`  details: ${p.index}/${p.total} ${p.name || ''}`)
      },
    })
  }

  console.log(`Places únicos: ${places.length}`)

  // Enrichment stub objects first via buildLead path
  const enrichedPlaces = args.enrich
    ? await enrichLeads(places, {
        enabled: true,
        onProgress: (p) => console.log(`  enrich: ${p.index}/${p.total} ${p.name || ''}`),
      })
    : places.map((p) => ({ ...p, enrichmentNotes: ['skipped'] }))

  let leads = enrichedPlaces.map((p) => {
    const enrichment = {
      ownerName: p.ownerName,
      ownerPhone: p.ownerPhone,
      ownerPhoneKind: p.ownerPhoneKind,
      ownerSource: p.ownerSource,
      emails: p.emails,
      instagram: p.instagram,
      enrichmentNotes: p.enrichmentNotes,
    }
    const lead = buildLead(p, client, enrichment)
    return attachMessages(scoreLead(lead, client), client)
  })

  if (args.llm && geminiKey) {
    console.log('Reescribiendo WhatsApp con Gemini…')
    for (let i = 0; i < leads.length; i += 1) {
      leads[i].msgWhatsapp = await craftWhatsappWithLlm(leads[i], client, { apiKey: geminiKey })
    }
  }

  leads.sort((a, b) => b.score - a.score)

  const stamp = stampNow()
  const result = await writeExports({
    outDir: args.outDir,
    stamp,
    clientId: client.id,
    leads,
    meta: {
      clientId: client.id,
      generatedAt: new Date().toISOString(),
      dryRun: args.dryRun,
      placeCount: places.length,
      leadCount: leads.length,
      hot: leads.filter((l) => l.scoreBand === 'hot').length,
      warm: leads.filter((l) => l.scoreBand === 'warm').length,
      cold: leads.filter((l) => l.scoreBand === 'cold').length,
      withMobile: leads.filter((l) => l.businessPhoneKind === 'mobile').length,
      withOwnerName: leads.filter((l) => l.ownerName).length,
      withOwnerPhone: leads.filter((l) => l.ownerPhone).length,
      notes: [
        'businessPhone* = teléfono del negocio en Google Maps/Places',
        'ownerPhone casi siempre vacío: Maps no publica celular del dueño',
        'Completar dueño/celular personal a mano o con fuente legítima aparte',
      ],
    },
  })

  console.log('\nExport listo (descargable):')
  console.log(`  JSON: ${result.jsonPath}`)
  console.log(`  CSV:  ${result.csvPath}`)
  console.log(`  HOT:  ${result.hotPath} (${result.prioritized} priorizados)`)
  console.log(`\nResumen: ${result.total} leads | mobile negocio: ${leads.filter((l) => l.businessPhoneKind === 'mobile').length} | ownerName: ${leads.filter((l) => l.ownerName).length} | ownerPhone: ${leads.filter((l) => l.ownerPhone).length}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
