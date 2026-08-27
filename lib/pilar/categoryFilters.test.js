import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { filterNegociosByCategoryIntent } from './categoryFilters.js'

describe('filterNegociosByCategoryIntent — mascotas', () => {
  const negocios = [
    { nombre: 'Casa Marea', categorias: { slug: 'gastronomia' }, subcategoria: 'Café' },
    { nombre: 'Vet Pilar', categorias: { slug: 'mascotas' }, subcategoria: 'Veterinaria' },
    { nombre: 'Aura Studio', categorias: { slug: 'belleza' }, subcategoria: 'Estética' },
  ]

  it('deja solo mascotas / veterinaria', () => {
    const out = filterNegociosByCategoryIntent(negocios, 'mascotas')
    assert.equal(out.length, 1)
    assert.equal(out[0].nombre, 'Vet Pilar')
  })
})
