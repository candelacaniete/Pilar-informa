import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BusinessForm from '@/components/admin/BusinessForm'
import { getCategorias } from '@/lib/data'

export default async function NuevoNegocioPage() {
  const categorias = await getCategorias()

  return (
    <div className="admin-page">
      <Link
        href="/admin/negocios"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a negocios
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Nuevo negocio</h1>
      <p className="mt-1 text-slate-600">Completá el formulario. No hace falta hacerlo de a pasos.</p>
      <div className="mt-6">
        <BusinessForm categorias={categorias} />
      </div>
    </div>
  )
}
