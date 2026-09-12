/**
 * Enriquecimiento best-effort desde el sitio público del negocio.
 *
 * Realidad: Google Maps casi nunca trae "dueño" ni celular personal.
 * Acá intentamos sacar pistas públicas (Instagram, nombres en /nosotros|/contacto).
 * Los campos de dueño quedan para completar a mano o con otra fuente legítima.
 */

const OWNER_NAME_RES = [
  /(?:dueñ[oa]|fundador(?:a)?|ceo|co-?fundador(?:a)?|propietari[oa])[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})/gi,
  /(?:soy|me llamo)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/gi,
]

const INSTAGRAM_RE = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]{2,30})/gi
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const PHONE_HINT_RE = /(?:\+?54\s*)?(?:9\s*)?(?:\d{2,4}[\s.-]*){1,2}\d{4}[\s.-]*\d{4}|\b15[\s.-]?\d{4}[\s.-]?\d{4}\b/g

function stripTags(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchText(url, { timeoutMs = 8000 } = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'GuiaPilarProspecting/0.1 (+research; contacto comercial)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) return null
    const ctype = res.headers.get('content-type') || ''
    if (!ctype.includes('text') && !ctype.includes('html') && !ctype.includes('xml')) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

function unique(list) {
  return [...new Set(list.filter(Boolean))]
}

function extractFromHtml(html) {
  const text = stripTags(html)
  const rawHtml = String(html || '')

  const instagram = []
  for (const m of rawHtml.matchAll(INSTAGRAM_RE)) {
    const handle = m[1]
    if (handle && !['p', 'reel', 'reels', 'stories', 'explore'].includes(handle.toLowerCase())) {
      instagram.push(handle.replace(/\/$/, ''))
    }
  }

  const emails = unique((rawHtml.match(EMAIL_RE) || []).filter((e) => !/example\.|sentry|wixpress|schema/i.test(e)))
  const phoneHints = unique(text.match(PHONE_HINT_RE) || [])

  const ownerNames = []
  for (const re of OWNER_NAME_RES) {
    re.lastIndex = 0
    for (const m of text.matchAll(re)) {
      if (m[1] && m[1].length < 60) ownerNames.push(m[1].trim())
    }
  }

  return {
    instagramHandles: unique(instagram).slice(0, 3),
    emails: emails.slice(0, 5),
    phoneHints: phoneHints.slice(0, 5),
    ownerNameCandidates: unique(ownerNames).slice(0, 3),
  }
}

/**
 * Intenta enriquecer un lead con datos públicos del website.
 */
export async function enrichFromWebsite(lead, { enabled = true } = {}) {
  const base = {
    ownerName: null,
    ownerPhone: null,
    ownerPhoneKind: null,
    ownerSource: null,
    emails: [],
    instagram: null,
    enrichmentNotes: [],
  }

  if (!enabled) {
    base.enrichmentNotes.push('enriquecimiento web desactivado')
    return { ...lead, ...base }
  }

  if (!lead.website) {
    base.enrichmentNotes.push('sin website en Maps — dueño no resoluble automáticamente')
    return { ...lead, ...base }
  }

  const html = await fetchText(lead.website)
  if (!html) {
    base.enrichmentNotes.push('no se pudo leer el website')
    return { ...lead, ...base }
  }

  const extracted = extractFromHtml(html)
  base.emails = extracted.emails
  base.instagram = extracted.instagramHandles[0]
    ? `https://instagram.com/${extracted.instagramHandles[0]}`
    : null

  if (extracted.ownerNameCandidates[0]) {
    base.ownerName = extracted.ownerNameCandidates[0]
    base.ownerSource = 'website_heuristic'
    base.enrichmentNotes.push('nombre de dueño candidato (verificar manualmente)')
  } else {
    base.enrichmentNotes.push('sin mención clara de dueño en home — completar a mano')
  }

  // Nunca asumir que un teléfono extra del sitio es del dueño: quedan como hints.
  if (extracted.phoneHints.length) {
    base.enrichmentNotes.push(`phones_extra_en_web: ${extracted.phoneHints.join(' | ')}`)
  }

  // ownerPhone queda null a propósito: celular personal del dueño casi nunca está público.
  base.ownerPhone = null
  base.ownerPhoneKind = null

  return { ...lead, ...base }
}

export async function enrichLeads(leads, options = {}) {
  const out = []
  for (let i = 0; i < leads.length; i += 1) {
    options.onProgress?.({ phase: 'enrich', index: i + 1, total: leads.length, name: leads[i].name })
    out.push(await enrichFromWebsite(leads[i], options))
  }
  return out
}
