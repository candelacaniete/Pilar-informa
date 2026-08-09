import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import BusinessCard from '@/components/public/BusinessCard'
import { getCategoriaBySlug, getNegociosActivos } from '@/lib/data'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const categoria = await getCategoriaBySlug(slug)
  if (!categoria) return { title: 'Categoría no encontrada' }
  return {
    title: categoria.nombre,
    description: `Negocios y servicios de ${categoria.nombre} en Pilar.`,
  }
}

export default async function CategoriaPage({ params }) {
  const { slug } = await params
  const categoria = await getCategoriaBySlug(slug)
  if (!categoria) notFound()

  const negocios = await getNegociosActivos({ categoriaSlug: slug })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Link
        href="/guia"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la guía
      </Link>

      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Categoría</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          <span className="mr-3" aria-hidden>
            {categoria.icono}
          </span>
          {categoria.nombre}
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          {negocios.length}{' '}
          {negocios.length === 1 ? 'lugar activo' : 'lugares activos'} en esta categoría.
        </p>
      </div>

      {negocios.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {negocios.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-ink">Todavía no hay negocios</p>
          <p className="mt-2 text-sm text-muted">Volvé pronto o explorá otra categoría.</p>
          <Link href="/guia" className="mt-6 inline-flex text-sm font-semibold text-teal">
            Ir a la guía
          </Link>
        </div>
      )}
    </div>
  )
}
