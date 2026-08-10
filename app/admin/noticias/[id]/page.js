import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SimpleContentForm from '@/components/admin/SimpleContentForm'
import { getAllNoticiasAdmin } from '@/lib/data'

export default async function EditarNoticiaPage({ params }) {
  const { id } = await params
  const items = await getAllNoticiasAdmin()
  const item = items.find((i) => i.id === id)
  if (!item) notFound()

  return (
    <div className="admin-page">
      <Link
        href="/admin/noticias"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a noticias
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Editar: {item.titulo}</h1>
      <p className="mt-1 text-slate-600">Actualizá el contenido y guardá los cambios.</p>
      <div className="mt-6">
        <SimpleContentForm type="noticia" initial={item} />
      </div>
    </div>
  )
}
