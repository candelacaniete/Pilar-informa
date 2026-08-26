import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { detectIntent } from './intent.js'

describe('detectIntent — gastronomía y merienda', () => {
  it('clasifica merendar / merienda como gastro (no general)', () => {
    assert.equal(detectIntent('lugares para merendar'), 'gastro')
    assert.equal(detectIntent('opciones para la merienda'), 'gastro')
    assert.equal(detectIntent('dónde desayunar el domingo'), 'gastro')
  })

  it('gastro gana sobre el catch-all "dónde"', () => {
    assert.equal(detectIntent('dónde puedo merendar'), 'gastro')
    assert.equal(detectIntent('donde tomar algo en pilar'), 'gastro')
  })

  it('mantiene otros intents', () => {
    assert.equal(detectIntent('dónde comer'), 'gastro')
    assert.equal(detectIntent('farmacia de turno'), 'farmacia')
    assert.equal(detectIntent('dónde está el gimnasio'), 'negocio')
    assert.equal(detectIntent('hola'), 'general')
  })
})

describe('detectIntent — mascotas', () => {
  it('clasifica veterinaria / mascota como mascotas (no negocio genérico)', () => {
    assert.equal(detectIntent('y para llevar a mi mascota?'), 'mascotas')
    assert.equal(detectIntent('veterinaria cerca'), 'mascotas')
    assert.equal(detectIntent('lugar para mi perro'), 'mascotas')
  })
})
