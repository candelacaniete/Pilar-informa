import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SimpleContentForm from '@/components/admin/SimpleContentForm'

export default function NuevaNoticiaPage() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <Link
        href="/admin/noticias"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a noticias
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Nueva noticia</h1>
      <p className="mt-1 text-slate-600">Escribí el título, el cuerpo y publicá cuando esté lista.</p>
      <div className="mt-6">
        <SimpleContentForm type="noticia" />
      </div>
    </div>
  )
}
