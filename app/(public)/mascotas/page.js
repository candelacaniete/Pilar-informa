import Link from 'next/link'
import { MapPin, MessageCircle, Plus } from 'lucide-react'
import { getMascotasAvisosPublicos } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { mascotaTipoLabel, mascotaWhatsappUrl } from '@/lib/mascotas/utils'

export const metadata = {
  title: 'Mascotas perdidas y encontradas',
  description:
    'Avisos de mascotas perdidas y encontradas en Pilar, Del Viso, Zelaya, Derqui y alrededores.',
}

export default async function MascotasPage({ searchParams }) {
  const params = await searchParams
  const tab = params?.tipo === 'encontrado' ? 'encontrado' : params?.tipo === 'perdido' ? 'perdido' : 'todos'
  const tipoFilter = tab === 'todos' ? undefined : tab
  const avisos = await getMascotasAvisosPublicos({ tipo: tipoFilter })

  const tabs = [
    { href: '/mascotas', label: 'Todos', active: tab === 'todos' },
    { href: '/mascotas?tipo=perdido', label: 'Perdidos', active: tab === 'perdido' },
    { href: '/mascotas?tipo=encontrado', label: 'Encontrados', active: tab === 'encontrado' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Comunidad</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Mascotas
          </h1>
          <p className="mt-3 text-base text-muted md:text-lg">
            Publicá un aviso si perdiste o encontraste una mascota en el partido de Pilar. Cada
            aviso se revisa antes de aparecer acá.
          </p>
        </div>
        <Link
          href="/mascotas/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3.5 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Plus className="h-4 w-4" />
          Publicar aviso
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar avisos">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            role="tab"
            aria-selected={t.active}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              t.active
                ? 'bg-teal text-white'
                : 'border border-line bg-white text-ink hover:border-teal hover:text-teal'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {avisos.map((aviso) => {
          const wa = mascotaWhatsappUrl(
            aviso.whatsapp_e164,
            `Hola, vi tu aviso "${aviso.titulo}" en Guía Pilar.`,
          )
          return (
            <article
              key={aviso.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
            >
              <Link href={`/mascotas/${aviso.slug}`} className="relative block aspect-[4/3] bg-paper-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={aviso.foto_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    aviso.tipo === 'perdido'
                      ? 'bg-amber-soft text-amber-950'
                      : 'bg-teal-soft text-teal-dark'
                  }`}
                >
                  {mascotaTipoLabel(aviso.tipo)}
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-display text-xl font-semibold text-ink">
                  <Link href={`/mascotas/${aviso.slug}`} className="hover:text-teal">
                    {aviso.titulo}
                  </Link>
                </h2>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {aviso.zona}
                  {aviso.fecha_hecho ? ` · ${formatDate(aviso.fecha_hecho)}` : ''}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white hover:brightness-95"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                  ) : null}
                  <Link
                    href={`/mascotas/${aviso.slug}`}
                    className="inline-flex items-center justify-center rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-ink hover:border-teal hover:text-teal"
                  >
                    Ver ficha
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {!avisos.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <p className="font-semibold text-ink">Todavía no hay avisos en esta lista</p>
          <p className="mt-1 text-sm text-muted">
            Si perdiste o encontraste una mascota, publicá el primero.
          </p>
          <Link
            href="/mascotas/nuevo"
            className="mt-5 inline-flex rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
          >
            Publicar aviso
          </Link>
        </div>
      ) : null}
    </div>
  )
}
