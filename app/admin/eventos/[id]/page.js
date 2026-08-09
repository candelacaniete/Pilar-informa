import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SimpleContentForm from '@/components/admin/SimpleContentForm'
import { getAllEventosAdmin } from '@/lib/data'

export default async function EditarEventoPage({ params }) {
  const { id } = await params
  const items = await getAllEventosAdmin()
  const item = items.find((i) => i.id === id)
  if (!item) notFound()

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a eventos
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Editar: {item.titulo}</h1>
      <p className="mt-1 text-slate-600">Actualizá los datos y guardá los cambios.</p>
      <div className="mt-6">
        <SimpleContentForm type="evento" initial={item} />
      </div>
    </div>
  )
}
