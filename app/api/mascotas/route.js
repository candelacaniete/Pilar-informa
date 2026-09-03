import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import { siteUrl } from '@/lib/utils'
import {
  isValidWhatsappAr,
  isZonaPilar,
  MASCOTA_EXPIRA_DIAS,
  MASCOTA_TITULO_MAX,
  normalizeWhatsappAr,
} from '@/lib/mascotas/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024

function jsonError(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

function makeResolveToken() {
  return randomBytes(24).toString('hex')
}

async function uniqueSlug(supabase, base) {
  let candidate = base || `aviso-${Date.now()}`
  for (let i = 0; i < 8; i += 1) {
    const { data } = await supabase
      .from('mascotas_avisos')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!data) return candidate
    candidate = `${base}-${randomBytes(2).toString('hex')}`
  }
  return `${base}-${Date.now()}`
}

export async function POST(request) {
  const supabase = createServiceClient()
  if (!supabase) {
    return jsonError('El servicio de mascotas no está configurado todavía.', 503)
  }

  let form
  try {
    form = await request.formData()
  } catch {
    return jsonError('Pedido inválido.')
  }

  const titulo = String(form.get('titulo') || '').trim()
  const tipo = String(form.get('tipo') || '').trim()
  const zona = String(form.get('zona') || '').trim()
  const whatsappRaw = String(form.get('whatsapp') || '').trim()
  const fechaHechoRaw = String(form.get('fecha_hecho') || '').trim()
  const foto = form.get('foto')

  if (!titulo || titulo.length < 3) {
    return jsonError('El título es obligatorio (mínimo 3 caracteres).')
  }
  if (titulo.length > MASCOTA_TITULO_MAX) {
    return jsonError(`El título puede tener hasta ${MASCOTA_TITULO_MAX} caracteres.`)
  }
  if (tipo !== 'perdido' && tipo !== 'encontrado') {
    return jsonError('Elegí si es Perdido o Encontrado.')
  }
  if (!isZonaPilar(zona)) {
    return jsonError('Elegí una zona válida de Pilar.')
  }
  if (!isValidWhatsappAr(whatsappRaw)) {
    return jsonError('El WhatsApp no es válido. Usá un celular argentino (ej. 11 1234-5678).')
  }
  if (!(foto instanceof File) || foto.size === 0) {
    return jsonError('La foto es obligatoria.')
  }
  if (!ALLOWED_TYPES.has(foto.type)) {
    return jsonError('La foto debe ser JPG, PNG o WebP.')
  }
  if (foto.size > MAX_BYTES) {
    return jsonError('La foto no puede superar 5 MB.')
  }

  let fechaHecho = null
  if (fechaHechoRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaHechoRaw)) {
      return jsonError('La fecha del hecho no es válida.')
    }
    fechaHecho = fechaHechoRaw
  }

  const whatsappE164 = normalizeWhatsappAr(whatsappRaw)
  const ext = foto.type === 'image/png' ? 'png' : foto.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `mascotas/${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`

  const buffer = Buffer.from(await foto.arrayBuffer())
  const { error: uploadError } = await supabase.storage.from('media').upload(path, buffer, {
    contentType: foto.type,
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadError) {
    console.error('mascotas upload error', uploadError)
    return jsonError('No pudimos subir la foto. Probá de nuevo.', 500)
  }

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(path)
  const fotoUrl = publicUrlData?.publicUrl
  if (!fotoUrl) {
    return jsonError('No pudimos obtener la URL de la foto.', 500)
  }

  const baseSlug = slugify(`${titulo}-${zona}-${tipo}`)
  const slug = await uniqueSlug(supabase, baseSlug)
  const resolveToken = makeResolveToken()

  const { data, error } = await supabase
    .from('mascotas_avisos')
    .insert({
      slug,
      titulo,
      tipo,
      zona,
      foto_url: fotoUrl,
      whatsapp_e164: whatsappE164,
      fecha_hecho: fechaHecho,
      estado: 'pendiente',
      resolve_token: resolveToken,
    })
    .select('id, slug, resolve_token')
    .single()

  if (error) {
    console.error('mascotas insert error', error)
    return jsonError('No pudimos guardar el aviso. Probá más tarde.', 500)
  }

  const base = siteUrl().replace(/\/$/, '')
  const manageUrl = `${base}/mascotas/gestionar/${data.resolve_token}`

  return NextResponse.json({
    ok: true,
    message: 'Tu aviso está en revisión',
    id: data.id,
    slug: data.slug,
    manageUrl,
    expiresInDays: MASCOTA_EXPIRA_DIAS,
  })
}
