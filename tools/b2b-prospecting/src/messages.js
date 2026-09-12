/**
 * Mensajes de cold outreach hiperpersonalizados (plantillas determinísticas).
 * Opcional: si hay GEMINI_API_KEY, se puede pedir variante LLM (flag --llm).
 */

function firstName(ownerName) {
  if (!ownerName) return null
  return String(ownerName).trim().split(/\s+/)[0]
}

function rubroHint(types) {
  const t = String(types || '').toLowerCase()
  if (t.includes('restaurant') || t.includes('food') || t.includes('cafe')) return 'gastronómico'
  if (t.includes('beauty') || t.includes('hair') || t.includes('spa')) return 'belleza'
  if (t.includes('gym') || t.includes('fitness')) return 'fitness'
  if (t.includes('veterinary') || t.includes('pet')) return 'mascotas'
  if (t.includes('car_repair') || t.includes('auto')) return 'auto'
  if (t.includes('dentist') || t.includes('doctor') || t.includes('health')) return 'salud'
  if (t.includes('real_estate')) return 'inmobiliario'
  if (t.includes('store') || t.includes('shop')) return 'comercio'
  return 'local'
}

export function craftWhatsappMessage(lead, client) {
  const name = firstName(lead.ownerName)
  const intro = name
    ? `Hola ${name}, soy del equipo de ${client.name}.`
    : `Hola, ¿hablo con alguien de ${lead.businessName}? Soy del equipo de ${client.name}.`
  const rubro = rubroHint(lead.types)
  const ratingBit =
    lead.rating && lead.reviewCount
      ? ` Vi que en Maps tienen ${lead.rating}★ (${lead.reviewCount} reseñas)`
      : ''
  const offer = client.offer

  return [
    intro,
    `Estamos armando la guía local de Pilar para que vecinos encuentren negocios como el de ustedes (${rubro}).${ratingBit}`,
    `La idea: ${offer.valueProp}. Plan ${offer.planHint}.`,
    `¿${offer.cta.charAt(0).toUpperCase()}${offer.cta.slice(1)}?`,
  ]
    .join(' ')
    .slice(0, client.message?.maxChars || 420)
}

export function craftEmailSubject(lead, client) {
  return `${lead.businessName} en la guía local de Pilar`
}

export function craftEmailBody(lead, client) {
  const name = firstName(lead.ownerName)
  const hello = name ? `Hola ${name},` : `Hola,`
  return [
    hello,
    '',
    `Te escribo por ${lead.businessName}. Estamos sumando comercios de Pilar a ${client.name} (${client.siteUrl}): una guía local para que los vecinos encuentren y contacten negocios de la zona.`,
    '',
    `Propuesta corta: ficha con foto, zona, WhatsApp y visibilidad en categorías. Planes ${client.offer.planHint}.`,
    '',
    `Si te sirve, ${client.offer.cta}.`,
    '',
    'Saludos,',
    client.name,
  ].join('\n')
}

export function attachMessages(lead, client) {
  return {
    ...lead,
    msgWhatsapp: craftWhatsappMessage(lead, client),
    msgEmailSubject: craftEmailSubject(lead, client),
    msgEmailBody: craftEmailBody(lead, client),
  }
}

/**
 * Variante opcional con Gemini si hay key.
 */
export async function craftWhatsappWithLlm(lead, client, { apiKey, model = 'gemini-2.0-flash' } = {}) {
  if (!apiKey) return craftWhatsappMessage(lead, client)

  const prompt = `Sos un SDR argentino. Redactá UN solo mensaje de WhatsApp en español rioplatense (vos), máximo ${client.message?.maxChars || 420} caracteres, tono ${client.message?.tone}.
Producto: ${client.name} — ${client.product}.
Lead: negocio="${lead.businessName}", dueño="${lead.ownerName || 'desconocido'}", rating=${lead.rating}, reviews=${lead.reviewCount}, rubro_types=${lead.types}, zona=${lead.address}.
Reglas: 1 CTA claro, sin emojis excesivos, no inventes datos del lead, no digas que scrapeaste Maps.
Devolvé solo el texto del mensaje.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  if (!res.ok) return craftWhatsappMessage(lead, client)
  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')?.trim()
  return text || craftWhatsappMessage(lead, client)
}
