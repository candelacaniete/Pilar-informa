import { classifyArPhone, pickBestBusinessPhone } from './phone.js'

function addressInTarget(address, localidades = []) {
  const a = String(address || '').toLowerCase()
  return localidades.some((loc) => a.includes(String(loc).toLowerCase()))
}

/**
 * Arma un lead comercial a partir de un place de Maps + enriquecimiento.
 */
export function buildLead(place, client, enrichment = {}) {
  const phone = pickBestBusinessPhone(place.nationalPhone, place.internationalPhone)
  const inTarget = addressInTarget(place.address, client.geo.includeLocalidades)

  return {
    clientId: client.id,
    placeId: place.placeId,
    businessName: place.name,
    address: place.address,
    localidadHint: inTarget ? 'pilar_partido' : 'revisar',
    lat: place.lat,
    lng: place.lng,
    types: (place.types || []).join('|'),
    rating: place.rating,
    reviewCount: place.reviewCount,
    businessStatus: place.businessStatus,
    website: place.website,
    mapsUrl: place.mapsUrl,
    sourceQueries: (place.sourceQueries || []).join(' | '),

    // Teléfono del NEGOCIO (lo que Maps suele tener)
    businessPhoneRaw: phone.raw,
    businessPhoneE164: phone.e164,
    businessPhoneKind: phone.kind,
    businessWhatsappLink: phone.whatsappLink,

    // Dueño (casi siempre vacío / heurística)
    ownerName: enrichment.ownerName || null,
    ownerPhone: enrichment.ownerPhone || null,
    ownerPhoneKind: enrichment.ownerPhoneKind || null,
    ownerSource: enrichment.ownerSource || null,
    emails: (enrichment.emails || []).join(' | '),
    instagram: enrichment.instagram || null,
    enrichmentNotes: (enrichment.enrichmentNotes || []).join(' | '),

    score: 0,
    scoreBand: 'cold',
    scoreReasons: '',
  }
}

export function scoreLead(lead, client) {
  const w = client.scoring.weights
  const reasons = []
  let score = 0

  if (lead.businessPhoneKind === 'mobile') {
    score += w.hasMobile
    reasons.push(`celular_negocio(+${w.hasMobile})`)
  } else if (lead.businessPhoneE164 || lead.businessPhoneRaw) {
    score += w.hasAnyPhone
    reasons.push(`telefono_negocio(+${w.hasAnyPhone})`)
  }

  if (lead.website) {
    score += w.hasWebsite
    reasons.push(`website(+${w.hasWebsite})`)
  }

  if (lead.instagram) {
    score += w.hasInstagramHint
    reasons.push(`instagram(+${w.hasInstagramHint})`)
  }

  if (lead.rating != null && lead.rating >= 4) {
    score += w.ratingGood
    reasons.push(`rating>=4(+${w.ratingGood})`)
  }

  if ((lead.reviewCount || 0) >= 20) {
    score += w.reviewVolume
    reasons.push(`reviews>=20(+${w.reviewVolume})`)
  }

  if (lead.localidadHint === 'pilar_partido') {
    score += w.inTargetLocalidad
    reasons.push(`en_partido(+${w.inTargetLocalidad})`)
  }

  if (lead.ownerName) {
    score += w.ownerNameFound
    reasons.push(`owner_name(+${w.ownerNameFound})`)
  }

  // Penalizar cerrados
  if (lead.businessStatus && lead.businessStatus !== 'OPERATIONAL') {
    score = Math.max(0, score - 30)
    reasons.push('status_no_operational(-30)')
  }

  const { hot, warm } = client.scoring.thresholds
  const scoreBand = score >= hot ? 'hot' : score >= warm ? 'warm' : 'cold'

  return {
    ...lead,
    score,
    scoreBand,
    scoreReasons: reasons.join(', '),
  }
}

export function classifyBusinessPhonesOnLead(lead) {
  // noop helper if raw already set
  if (lead.businessPhoneKind) return lead
  const info = classifyArPhone(lead.businessPhoneRaw)
  return {
    ...lead,
    businessPhoneE164: info.e164,
    businessPhoneKind: info.kind,
    businessWhatsappLink: info.whatsappLink,
  }
}
