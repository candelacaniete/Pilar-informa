import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import FarmaciaTurnoForm from '@/components/admin/FarmaciaTurnoForm'
import { getAllFarmaciasTurnoAdmin } from '@/lib/data'

export default async function EditarFarmaciaTurnoPage({ params }) {
  const { id } = await params
  const items = await getAllFarmaciasTurnoAdmin()
  const item = items.find((i) => i.id === id)
  if (!item) notFound()

  return (
    <div className="admin-page">
      <Link
        href="/admin/farmacias"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a farmacias
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Editar: {item.nombre}</h1>
      <p className="mt-1 text-slate-600">Actualizá zona, fecha u horario y guardá.</p>
      <div className="mt-6">
        <FarmaciaTurnoForm initial={item} />
      </div>
    </div>
  )
}
