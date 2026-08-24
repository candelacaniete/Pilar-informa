import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResenasByNegocioSlug } from '@/lib/data'
import { getRequestIpHash } from '@/lib/resenas/server'

export async function GET(request) {
  const slug = new URL(request.url).searchParams.get('slug')?.trim()
  if (!slug) {
    return NextResponse.json({ error: 'Falta slug' }, { status: 400 })
  }

  try {
    const resenas = await getResenasByNegocioSlug(slug)
    return NextResponse.json({ resenas })
  } catch (err) {
    console.error('Resenas GET error:', err)
    return NextResponse.json({ resenas: [] })
  }
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 })
  }

  const slug = String(body?.slug || '').trim()
  const codigo = String(body?.codigo || '').trim()
  const calificacion = Number(body?.calificacion)
  const texto = body?.texto != null ? String(body.texto) : ''

  if (!slug) {
    return NextResponse.json({ error: 'Falta el negocio.' }, { status: 400 })
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Las reseñas requieren Supabase configurado.' },
      { status: 503 },
    )
  }

  try {
    const ipHash = await getRequestIpHash()
    const { data, error } = await supabase.rpc('resena_crear', {
      p_negocio_slug: slug,
      p_codigo: codigo,
      p_calificacion: calificacion,
      p_texto: texto,
      p_ip_hash: ipHash,
    })

    if (error) {
      console.error('resena_crear error:', error)
      return NextResponse.json(
        { error: 'No pudimos publicar la reseña. Probá de nuevo.' },
        { status: 500 },
      )
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row?.ok) {
      return NextResponse.json({ error: row?.mensaje || 'No se pudo publicar.' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: row.mensaje, id: row.resena_id })
  } catch (err) {
    console.error('Resenas API error:', err)
    return NextResponse.json({ error: 'Error interno. Probá más tarde.' }, { status: 500 })
  }
}
