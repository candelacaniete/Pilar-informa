import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { filterNegociosByCategoryIntent } from './categoryFilters.js'

describe('filterNegociosByCategoryIntent — mascotas', () => {
  const negocios = [
    { nombre: 'Katem', categorias: { slug: 'tecnologia' }, subcategoria: 'Desarrollo web' },
    { nombre: 'Vet Ejemplo', categorias: { slug: 'mascotas' }, subcategoria: 'Veterinaria' },
    { nombre: 'Aura Ejemplo', categorias: { slug: 'belleza' }, subcategoria: 'Estética' },
  ]

  it('deja solo mascotas / veterinaria', () => {
    const out = filterNegociosByCategoryIntent(negocios, 'mascotas')
    assert.equal(out.length, 1)
    assert.equal(out[0].nombre, 'Vet Ejemplo')
  })
})
