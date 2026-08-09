import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import BusinessForm from '@/components/admin/BusinessForm'
import { getCategorias, getNegocioAdminById } from '@/lib/data'

export default async function EditarNegocioPage({ params }) {
  const { id } = await params
  const [negocio, categorias] = await Promise.all([getNegocioAdminById(id), getCategorias()])
  if (!negocio) notFound()

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <Link
        href="/admin/negocios"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a negocios
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Editar: {negocio.nombre}</h1>
      <p className="mt-1 text-slate-600">Actualizá los datos y guardá los cambios.</p>
      <div className="mt-6">
        <BusinessForm categorias={categorias} initial={negocio} />
      </div>
    </div>
  )
}
