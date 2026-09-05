import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin } from 'lucide-react'
import MascotaResolverButton from '@/components/public/MascotaResolverButton'
import { getMascotaAvisoByResolveToken } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { mascotaEstadoLabel, mascotaTipoLabel } from '@/lib/mascotas/utils'

export const metadata = {
  title: 'Gestionar aviso de mascota',
  robots: { index: false, follow: false },
}

export default async function MascotaGestionarPage({ params }) {
  const { token } = await params
  const aviso = await getMascotaAvisoByResolveToken(token)
  if (!aviso) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 py-10 md:px-6 md:py-14">
      <Link
        href="/mascotas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Mascotas
      </Link>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Tu aviso</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Gestionar publicación
        </h1>
        <p className="mt-3 text-sm text-muted">
          Este link es privado. Usalo para marcar el aviso como resuelto cuando ya no haga falta
          mostrarlo.
        </p>
      </div>

      <article className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="aspect-[16/10] bg-paper-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={aviso.foto_url} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-ink">{aviso.titulo}</h2>
            <span className="rounded-lg bg-paper-deep px-2 py-0.5 text-xs font-semibold text-ink-soft">
              {mascotaEstadoLabel(aviso.estado)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">
            {mascotaTipoLabel(aviso.tipo)} ·{' '}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {aviso.zona}
            </span>
            {aviso.fecha_hecho ? ` · ${formatDate(aviso.fecha_hecho)}` : ''}
          </p>

          <div className="mt-6">
            <MascotaResolverButton token={token} estado={aviso.estado} />
          </div>
        </div>
      </article>
    </div>
  )
}
