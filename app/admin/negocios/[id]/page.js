import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import BusinessForm from '@/components/admin/BusinessForm'
import ResenasAdmin from '@/components/admin/ResenasAdmin'
import { getCategorias, getNegocioAdminById, getResenasAdmin } from '@/lib/data'

export default async function EditarNegocioPage({ params }) {
  const { id } = await params
  const negocio = await getNegocioAdminById(id)
  if (!negocio) notFound()

  const [categorias, resenas] = await Promise.all([
    getCategorias(),
    getResenasAdmin(negocio.id),
  ])

  return (
    <div className="admin-page">
      <Link
        href="/admin/negocios"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a negocios
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Editar: {negocio.nombre}</h1>
      <p className="mt-1 text-slate-600">Actualizá los datos y guardá los cambios.</p>
      <div className="mt-6 space-y-6">
        <BusinessForm categorias={categorias} initial={negocio} />
        <ResenasAdmin negocioId={negocio.id} resenasIniciales={resenas} />
      </div>
    </div>
  )
}
