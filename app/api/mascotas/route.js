import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { createServerWriteClient } from '@/lib/supabase/admin'
import { slugify, siteUrl } from '@/lib/utils'
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

export async function POST(request) {
  const { client: supabase, mode } = createServerWriteClient()
  if (!supabase) {
    return jsonError(
      'Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY) en Vercel.',
      503,
    )
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
    const detail = uploadError.message || ''
    const needsMigration =
      /row-level security|policy|permission|not allowed|Unauthorized/i.test(detail)
    return jsonError(
      needsMigration
        ? 'No pudimos subir la foto. Corré la migración 021 en Supabase (upload público a media/mascotas).'
        : 'No pudimos subir la foto. Probá de nuevo.',
      500,
    )
  }

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(path)
  const fotoUrl = publicUrlData?.publicUrl
  if (!fotoUrl) {
    return jsonError('No pudimos obtener la URL de la foto.', 500)
  }

  // Sufijo random: evita colisiones sin leer filas pendientes (RLS anon no las ve)
  const slug = `${slugify(`${titulo}-${zona}-${tipo}`) || 'aviso'}-${randomBytes(3).toString('hex')}`
  const resolveToken = makeResolveToken()

  // RPC security definer (migración 022) — no depende del INSERT RLS
  const { data: rpcData, error: rpcError } = await supabase.rpc('mascota_aviso_crear', {
    p_slug: slug,
    p_titulo: titulo,
    p_tipo: tipo,
    p_zona: zona,
    p_foto_url: fotoUrl,
    p_whatsapp_e164: whatsappE164,
    p_fecha_hecho: fechaHecho,
    p_resolve_token: resolveToken,
  })

  if (rpcError) {
    console.error('mascotas rpc error', rpcError)
    const detail = rpcError.message || ''

    // Fallback: insert directo si la 022 aún no está
    if (/function|does not exist|schema cache|Could not find the function/i.test(detail)) {
      const { error: insertError } = await supabase.from('mascotas_avisos').insert({
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

      if (insertError) {
        console.error('mascotas insert fallback error', insertError)
        const insertDetail = insertError.message || ''
        if (/row-level security|policy/i.test(insertDetail)) {
          return jsonError(
            'Falta correr la migración 022 en Supabase (función mascota_aviso_crear). Si ya la corriste, recargá el schema cache: Settings → API → Reload.',
            503,
          )
        }
        return jsonError(
          `No pudimos guardar el aviso.${insertDetail ? ` (${insertDetail})` : ''}`,
          500,
        )
      }
    } else {
      return jsonError(
        `No pudimos guardar el aviso.${detail ? ` (${detail})` : ''}`,
        500,
      )
    }
  } else {
    const row = typeof rpcData === 'object' && rpcData ? rpcData : null
    if (row && row.ok === false) {
      return jsonError(row.mensaje || 'No pudimos guardar el aviso.', 400)
    }
  }

  const base = siteUrl().replace(/\/$/, '')
  const manageUrl = `${base}/mascotas/gestionar/${resolveToken}`

  return NextResponse.json({
    ok: true,
    message: 'Tu aviso está en revisión',
    slug,
    manageUrl,
    expiresInDays: MASCOTA_EXPIRA_DIAS,
    writeMode: mode,
  })
}
