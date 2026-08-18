import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FarmaciaTurnoForm from '@/components/admin/FarmaciaTurnoForm'

export default function NuevaFarmaciaTurnoPage() {
  return (
    <div className="admin-page">
      <Link
        href="/admin/farmacias"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a farmacias
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Nuevo turno</h1>
      <p className="mt-1 text-slate-600">Indicá zona, día y horario de la farmacia de guardia.</p>
      <div className="mt-6">
        <FarmaciaTurnoForm />
      </div>
    </div>
  )
}
