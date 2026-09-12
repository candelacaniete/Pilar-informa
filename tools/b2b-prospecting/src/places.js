/**
 * Cliente Google Places API (New).
 * Docs: https://developers.google.com/maps/documentation/places/web-service/op-overview
 *
 * Requiere GOOGLE_PLACES_API_KEY con Places API (New) habilitada.
 * No scrapea HTML de Google Maps (frágil + viola ToS).
 */

const PLACES_BASE = 'https://places.googleapis.com/v1'

const SEARCH_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
  'places.rating',
  'places.userRatingCount',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.businessStatus',
  'nextPageToken',
].join(',')

const DETAIL_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'types',
  'rating',
  'userRatingCount',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'websiteUri',
  'googleMapsUri',
  'businessStatus',
  'regularOpeningHours',
].join(',')

function requireApiKey(apiKey) {
  if (!apiKey) {
    throw new Error(
      'Falta GOOGLE_PLACES_API_KEY. Creá una key en Google Cloud Console con Places API (New) habilitada.',
    )
  }
  return apiKey
}

async function placesFetch(path, { apiKey, method = 'GET', body, fieldMask }) {
  const res = await fetch(`${PLACES_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`Places API respuesta no-JSON (${res.status}): ${text.slice(0, 200)}`)
  }

  if (!res.ok) {
    const msg = json?.error?.message || text.slice(0, 300)
    throw new Error(`Places API HTTP ${res.status}: ${msg}`)
  }
  return json
}

/**
 * Text Text search con sesgo a Pilar.
 */
export async function searchText(query, client, { apiKey, pageToken, pageSize = 20 } = {}) {
  const key = requireApiKey(apiKey)
  const body = {
    textQuery: query,
    languageCode: 'es',
    regionCode: 'AR',
    pageSize,
    locationBias: {
      circle: {
        center: {
          latitude: client.geo.lat,
          longitude: client.geo.lng,
        },
        radius: client.geo.radiusMeters,
      },
    },
  }
  if (pageToken) body.pageToken = pageToken

  return placesFetch('/places:searchText', {
    apiKey: key,
    method: 'POST',
    body,
    fieldMask: SEARCH_FIELD_MASK,
  })
}

export async function getPlaceDetails(placeId, { apiKey } = {}) {
  const key = requireApiKey(apiKey)
  const id = String(placeId || '').replace(/^places\//, '')
  return placesFetch(`/places/${id}`, {
    apiKey: key,
    method: 'GET',
    fieldMask: DETAIL_FIELD_MASK,
  })
}

export function normalizePlace(place) {
  const id = String(place.id || '').replace(/^places\//, '')
  return {
    placeId: id,
    name: place.displayName?.text || place.displayName || null,
    address: place.formattedAddress || null,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    types: place.types || [],
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? 0,
    nationalPhone: place.nationalPhoneNumber || null,
    internationalPhone: place.internationalPhoneNumber || null,
    website: place.websiteUri || null,
    mapsUrl: place.googleMapsUri || null,
    businessStatus: place.businessStatus || null,
  }
}

/**
 * Corre varias queries, dedupe por placeId, opcionalmente pide detalles.
 */
export async function harvestPlaces(client, {
  apiKey,
  queries = client.queries,
  maxPagesPerQuery = 1,
  enrichDetails = false,
  sleepMs = 200,
  onProgress,
} = {}) {
  const byId = new Map()

  for (const query of queries) {
    let pageToken
    for (let page = 0; page < maxPagesPerQuery; page += 1) {
      onProgress?.({ phase: 'search', query, page: page + 1 })
      const data = await searchText(query, client, { apiKey, pageToken })
      for (const raw of data.places || []) {
        const place = normalizePlace(raw)
        if (!place.placeId) continue
        if (client.excludedTypes?.some((t) => place.types.includes(t))) continue
        if (!byId.has(place.placeId)) byId.set(place.placeId, { ...place, sourceQueries: [query] })
        else {
          const prev = byId.get(place.placeId)
          prev.sourceQueries = [...new Set([...(prev.sourceQueries || []), query])]
        }
      }
      pageToken = data.nextPageToken
      if (!pageToken) break
      await sleep(sleepMs)
    }
  }

  const places = [...byId.values()]

  if (enrichDetails && apiKey) {
    for (let i = 0; i < places.length; i += 1) {
      onProgress?.({ phase: 'details', index: i + 1, total: places.length, name: places[i].name })
      try {
        const detail = normalizePlace(await getPlaceDetails(places[i].placeId, { apiKey }))
        Object.assign(places[i], detail, { sourceQueries: places[i].sourceQueries })
      } catch (err) {
        places[i].detailError = err.message
      }
      await sleep(sleepMs)
    }
  }

  return places
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
