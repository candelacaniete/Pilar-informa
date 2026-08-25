/**
 * Detecta e inserta eventos de ciclo de vida al guardar un negocio desde el admin.
 * Forward-looking only (sin backfill).
 */

function toTime(value) {
  if (!value) return null
  const t = new Date(value).getTime()
  return Number.isFinite(t) ? t : null
}

function isoDay(value) {
  if (!value) return null
  return String(value).slice(0, 10)
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{
 *   negocioId: string,
 *   isNew: boolean,
 *   before?: object | null,
 *   after: object,
 * }} args
 */
export async function recordNegocioEvents(supabase, { negocioId, isNew, before, after }) {
  if (!supabase || !negocioId || !after) return

  const rows = []

  if (isNew) {
    rows.push({
      negocio_id: negocioId,
      tipo_evento: 'alta',
      detalle: {
        plan: after.plan,
        estado: after.estado,
        fuente_alta: after.fuente_alta ?? null,
      },
    })
  } else if (before) {
    if (before.plan !== after.plan) {
      rows.push({
        negocio_id: negocioId,
        tipo_evento: 'cambio_plan',
        detalle: {
          plan_antes: before.plan,
          plan_despues: after.plan,
        },
      })
    }

    if (before.estado !== 'vencido' && after.estado === 'vencido') {
      rows.push({
        negocio_id: negocioId,
        tipo_evento: 'baja',
        detalle: {
          estado_antes: before.estado,
          plan: after.plan,
        },
      })
    }

    const staysActivo = after.estado === 'activo'
    const venceAntes = toTime(before.plan_vence)
    const venceDespues = toTime(after.plan_vence)
    const venceExtendido =
      venceDespues != null && (venceAntes == null || venceDespues > venceAntes)

    const pagoAntes = isoDay(before.fecha_pago)
    const pagoDespues = isoDay(after.fecha_pago)
    const pagoAvanza = Boolean(pagoDespues && pagoDespues !== pagoAntes)

    if (staysActivo && (venceExtendido || pagoAvanza)) {
      rows.push({
        negocio_id: negocioId,
        tipo_evento: 'renovacion',
        detalle: {
          plan_vence_antes: before.plan_vence || null,
          plan_vence_despues: after.plan_vence || null,
          fecha_pago_antes: before.fecha_pago || null,
          fecha_pago_despues: after.fecha_pago || null,
          plan: after.plan,
        },
      })
    }
  }

  if (!rows.length) return

  const { error } = await supabase.from('negocio_eventos').insert(rows)
  if (error) {
    const msg = String(error.message || '').toLowerCase()
    // Tabla aún no migrada (014): no tumbar el guardado del negocio.
    if (
      error.code === '42P01' ||
      msg.includes('does not exist') ||
      msg.includes('schema cache') ||
      msg.includes('negocio_eventos')
    ) {
      console.warn('negocio_eventos aún no disponible; se omitió el registro de eventos')
      return
    }
    console.error('negocio_eventos insert failed', error)
    throw error
  }
}
