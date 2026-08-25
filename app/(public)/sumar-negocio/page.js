import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AltaNegocioForm from '@/components/public/AltaNegocioForm'
import { getCategorias } from '@/lib/data'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { CONTACT_WHATSAPP_DISPLAY } from '@/lib/whatsapp'

export const metadata = buildPageMetadata({
  title: 'Sumar mi negocio',
  description:
    'Completá el formulario para sumar tu comercio o profesional a Guía Pilar. Te respondemos por WhatsApp.',
  path: '/sumar-negocio',
})

export default async function SumarNegocioPage() {
  const categorias = await getCategorias()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Alta de negocios</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Sumá tu negocio a Guía Pilar
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        Completá los datos y te llega un mensaje precargado a WhatsApp ({CONTACT_WHATSAPP_DISPLAY}).
        Coordinamos el plan, las fotos y la publicación.
      </p>

      <div className="mt-10 rounded-[1.5rem] border border-line/70 bg-white/80 p-5 shadow-soft md:p-8">
        <AltaNegocioForm categorias={categorias} />
      </div>
    </div>
  )
}
