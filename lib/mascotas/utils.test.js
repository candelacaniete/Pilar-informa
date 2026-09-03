import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isValidWhatsappAr, normalizeWhatsappAr } from './utils.js'
import { classifyTrafficSource } from '../analytics/referrer.js'

describe('whatsapp AR', () => {
  it('normaliza formatos locales', () => {
    assert.equal(normalizeWhatsappAr('11 7373-9450'), '5491173739450')
    assert.equal(normalizeWhatsappAr('1173739450'), '5491173739450')
    assert.equal(normalizeWhatsappAr('+54 9 11 7373-9450'), '5491173739450')
    assert.equal(normalizeWhatsappAr('5491173739450'), '5491173739450')
  })

  it('rechaza inválidos', () => {
    assert.equal(isValidWhatsappAr(''), false)
    assert.equal(isValidWhatsappAr('123'), false)
    assert.equal(isValidWhatsappAr('abc'), false)
  })
})

describe('traffic source', () => {
  it('clasifica referrers', () => {
    assert.equal(classifyTrafficSource({ referrer: '' }), 'directo')
    assert.equal(classifyTrafficSource({ referrer: 'https://www.instagram.com/p/x' }), 'instagram')
    assert.equal(classifyTrafficSource({ referrer: 'https://api.whatsapp.com/send' }), 'whatsapp')
    assert.equal(classifyTrafficSource({ referrer: 'https://www.google.com/search?q=x' }), 'google')
    assert.equal(classifyTrafficSource({ utmSource: 'instagram' }), 'instagram')
  })
})
