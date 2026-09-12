/**
 * Utilidades de teléfono AR: normalizar, detectar celular vs fijo.
 * Google Places suele devolver el teléfono del negocio, no el del dueño.
 */

const NON_DIGIT = /\D+/g

export function digitsOnly(value) {
  return String(value || '').replace(NON_DIGIT, '')
}

/**
 * Normaliza a E.164 aproximado AR (+54…).
 * Acepta: 11 15..., 011 15..., +54 9 11..., 2304..., etc.
 */
export function normalizeArPhone(raw) {
  if (!raw) return null
  let d = digitsOnly(raw)
  if (!d) return null

  // Quitar prefijo internacional duplicado raro
  if (d.startsWith('0054')) d = d.slice(4)
  if (d.startsWith('54') && d.length >= 12) {
    // ok, keep
  } else if (d.startsWith('0')) {
    d = d.slice(1)
  }

  // Local con 15 (celular): 11 15 XXXX-XXXX → 9 11 XXXXXXXX
  // Formato histórico: área + 15 + número
  const with15 = d.match(/^(\d{2,4})15(\d{6,8})$/)
  if (with15) {
    const area = with15[1]
    const rest = with15[2]
    return `+549${area}${rest}`
  }

  if (d.startsWith('54')) {
    return `+${d}`
  }

  // Si ya viene como 9 + área + número
  if (d.startsWith('9') && d.length >= 11) {
    return `+54${d}`
  }

  // Fijo / celular sin 9: asumir AR
  if (d.length >= 8 && d.length <= 11) {
    return `+54${d}`
  }

  return raw.trim() || null
}

/**
 * Heurística: en AR, celular internacional usa +54 9 …
 * El "15" local también indica móvil.
 */
export function classifyArPhone(raw) {
  const normalized = normalizeArPhone(raw)
  const d = digitsOnly(normalized || raw)
  if (!d) {
    return { kind: 'unknown', normalized: null, e164: null, whatsappLink: null }
  }

  const has15 = /(?:^|[^0-9])15\d{6,8}/.test(String(raw || '')) || /15\d{6,8}/.test(d)
  const isMobile =
    d.startsWith('549') ||
    (d.startsWith('54') && d[2] === '9') ||
    has15 ||
    (normalized && normalized.startsWith('+549'))

  const e164 = normalized && normalized.startsWith('+') ? normalized : null
  const waDigits = e164 ? digitsOnly(e164) : null

  return {
    kind: isMobile ? 'mobile' : d.length >= 8 ? 'landline' : 'unknown',
    normalized,
    e164,
    whatsappLink: waDigits && isMobile ? `https://wa.me/${waDigits}` : null,
  }
}

export function pickBestBusinessPhone(national, international) {
  const candidates = [international, national].filter(Boolean)
  if (!candidates.length) return { raw: null, ...classifyArPhone(null) }

  const scored = candidates.map((raw) => {
    const info = classifyArPhone(raw)
    const score = info.kind === 'mobile' ? 3 : info.kind === 'landline' ? 2 : 1
    return { raw, ...info, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0]
}
