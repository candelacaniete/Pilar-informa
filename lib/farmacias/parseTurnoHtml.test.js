import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { parseColfarmaTurnoHtml, parseTurnoTexto } from './parseTurnoHtml.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixture = readFileSync(join(__dirname, 'fixtures/colfarma-turno.html'), 'utf8')

describe('parseTurnoTexto', () => {
  it('parsea rango típico 08:00 → 08:00 día siguiente', () => {
    const t = parseTurnoTexto(
      'Turno comenzado el 26 de agosto a las 08:00 hs. Finaliza el 27 de agosto a las 08:00 hs.',
      { year: 2026 },
    )
    assert.equal(t.fecha, '2026-08-26')
    assert.equal(t.turno_desde, '2026-08-26T08:00:00-03:00')
    assert.equal(t.turno_hasta, '2026-08-27T08:00:00-03:00')
    assert.match(t.horario, /08:00/)
  })
})

describe('parseColfarmaTurnoHtml (fixture real)', () => {
  it('extrae 6 farmacias en 5 localidades (Villa Rosa ×2)', () => {
    const { farmacias, fechas, count } = parseColfarmaTurnoHtml(fixture, {
      now: new Date('2026-08-26T12:00:00-03:00'),
    })

    assert.equal(count, 6)
    assert.deepEqual(fechas, ['2026-08-26'])

    const localidades = [...new Set(farmacias.map((f) => f.localidad))]
    assert.deepEqual(localidades.sort(), [
      'Del Viso',
      'Manuel Alberti',
      'Pilar',
      'Pte Derqui',
      'Villa Rosa',
    ])

    const villaRosa = farmacias.filter((f) => f.localidad === 'Villa Rosa')
    assert.equal(villaRosa.length, 2)
    assert.ok(villaRosa.some((f) => f.nombre === 'REYNAGA'))
    assert.ok(villaRosa.some((f) => f.nombre === 'SANTA GUADALUPE'))

    const gutkind = farmacias.find((f) => f.nombre === 'GUTKIND')
    assert.ok(gutkind)
    assert.equal(gutkind.direccion, 'Independencia 7032')
    assert.match(gutkind.telefono, /02320/)
    assert.match(gutkind.maps_url, /google\.com\/maps/)
    assert.equal(gutkind.fuente, 'colfarma')
    assert.equal(gutkind.fecha, '2026-08-26')
  })

  it('falla con HTML sin turnos', () => {
    assert.throws(() => parseColfarmaTurnoHtml('<html><body>sin datos</body></html>'), /No se encontraron/)
  })
})
