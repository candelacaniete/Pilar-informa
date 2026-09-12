import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyArPhone, normalizeArPhone, pickBestBusinessPhone } from './phone.js'
import { buildLead, scoreLead } from './score.js'
import { craftWhatsappMessage } from './messages.js'
import { toCsv } from './export.js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('normalizeArPhone detects mobile with 15', () => {
  const n = normalizeArPhone('011 15-2345-6789')
  assert.equal(n, '+5491123456789')
  assert.equal(classifyArPhone('011 15-2345-6789').kind, 'mobile')
})

test('classifyArPhone landline', () => {
  const info = classifyArPhone('+54 230 444-1100')
  assert.equal(info.kind, 'landline')
  assert.equal(info.whatsappLink, null)
})

test('pickBestBusinessPhone prefers mobile', () => {
  const best = pickBestBusinessPhone('0230 444-1100', '+54 9 11 5555-1212')
  assert.equal(best.kind, 'mobile')
})

test('scoreLead marks hot when mobile + target + rating', async () => {
  const client = JSON.parse(
    await readFile(path.join(__dirname, '../clients/guia-pilar.json'), 'utf8'),
  )
  const place = {
    placeId: 'x',
    name: 'Test',
    address: 'Del Viso, Buenos Aires',
    types: ['restaurant'],
    rating: 4.5,
    reviewCount: 50,
    nationalPhone: '+54 9 11 2222-3333',
    internationalPhone: '+54 9 11 2222-3333',
    website: 'https://example.com',
    mapsUrl: null,
    businessStatus: 'OPERATIONAL',
    sourceQueries: ['q'],
  }
  const lead = scoreLead(
    buildLead(place, client, { ownerName: 'Ana Pérez', emails: [], enrichmentNotes: [] }),
    client,
  )
  assert.ok(lead.score >= client.scoring.thresholds.hot)
  assert.equal(lead.scoreBand, 'hot')
  assert.match(craftWhatsappMessage(lead, client), /Ana|Test|Pilar/)
})

test('toCsv includes header and escapes commas', () => {
  const csv = toCsv([
    {
      score: 1,
      scoreBand: 'cold',
      businessName: 'A, B',
      ownerName: null,
      businessPhoneRaw: null,
      businessPhoneE164: null,
      businessPhoneKind: null,
      businessWhatsappLink: null,
      ownerPhone: null,
      ownerPhoneKind: null,
      emails: '',
      instagram: null,
      address: null,
      localidadHint: null,
      rating: null,
      reviewCount: 0,
      website: null,
      mapsUrl: null,
      types: '',
      businessStatus: null,
      sourceQueries: '',
      ownerSource: null,
      enrichmentNotes: '',
      scoreReasons: '',
      msgWhatsapp: 'hola',
      msgEmailSubject: 's',
      msgEmailBody: 'b',
      placeId: '1',
      lat: null,
      lng: null,
      clientId: 'guia-pilar',
    },
  ])
  assert.match(csv, /^score,scoreBand/)
  assert.match(csv, /"A, B"/)
})
