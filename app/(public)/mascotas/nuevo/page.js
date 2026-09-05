import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MascotaAvisoForm from '@/components/public/MascotaAvisoForm'

export const metadata = {
  title: 'Publicar aviso de mascota',
  description: 'Publicá un aviso de mascota perdida o encontrada en Pilar.',
}

export default function NuevaMascotaPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:px-6 md:py-14">
      <Link
        href="/mascotas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Mascotas
      </Link>
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Mascotas</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Publicar aviso
        </h1>
        <p className="mt-3 text-sm text-muted md:text-base">
          Completá los datos y lo revisamos antes de publicarlo. Vas a recibir un link para marcar
          el aviso como resuelto cuando corresponda.
        </p>
      </div>
      <div className="mt-8">
        <MascotaAvisoForm />
      </div>
    </div>
  )
}
