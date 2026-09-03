import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react'
import MascotaShareButtons from '@/components/public/MascotaShareButtons'
import ViewTracker from '@/components/public/ViewTracker'
import { getMascotaAvisoBySlug } from '@/lib/data'
import { formatDate, siteUrl } from '@/lib/utils'
import { mascotaTipoLabel, mascotaWhatsappUrl } from '@/lib/mascotas/utils'
import { buildPageMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const aviso = await getMascotaAvisoBySlug(slug)
  if (!aviso) return { title: 'Aviso no encontrado' }
  return buildPageMetadata({
    title: `${aviso.titulo} · ${mascotaTipoLabel(aviso.tipo)}`,
    description: `${mascotaTipoLabel(aviso.tipo)} en ${aviso.zona}. Aviso en Guía Pilar.`,
    path: `/mascotas/${aviso.slug}`,
    image: aviso.foto_url,
  })
}

export default async function MascotaFichaPage({ params }) {
  const { slug } = await params
  const aviso = await getMascotaAvisoBySlug(slug)
  if (!aviso) notFound()

  const url = `${siteUrl().replace(/\/$/, '')}/mascotas/${aviso.slug}`
  const wa = mascotaWhatsappUrl(
    aviso.whatsapp_e164,
    `Hola, vi tu aviso "${aviso.titulo}" en Guía Pilar.`,
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <ViewTracker
        entityType="mascota"
        entityId={aviso.id}
        entitySlug={aviso.slug}
        entityTitle={aviso.titulo}
      />

      <Link
        href="/mascotas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Mascotas
      </Link>

      <article className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="relative aspect-[16/10] bg-paper-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={aviso.foto_url} alt="" className="h-full w-full object-cover" />
          <span
            className={`absolute left-4 top-4 rounded-lg px-2.5 py-1 text-xs font-semibold ${
              aviso.tipo === 'perdido'
                ? 'bg-amber-soft text-amber-950'
                : 'bg-teal-soft text-teal-dark'
            }`}
          >
            {mascotaTipoLabel(aviso.tipo)}
          </span>
        </div>

        <div className="p-5 md:p-7">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {aviso.titulo}
          </h1>
          <p className="mt-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {aviso.zona}
            </span>
            {aviso.fecha_hecho ? <span>Hecho: {formatDate(aviso.fecha_hecho)}</span> : null}
            <span>Publicado: {formatDate(aviso.creado_en)}</span>
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white hover:brightness-95"
              >
                <MessageCircle className="h-4 w-4" />
                Contactar por WhatsApp
              </a>
            ) : null}
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <h2 className="text-sm font-semibold text-ink">Compartir</h2>
            <div className="mt-3">
              <MascotaShareButtons
                titulo={aviso.titulo}
                tipo={aviso.tipo}
                zona={aviso.zona}
                url={url}
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
