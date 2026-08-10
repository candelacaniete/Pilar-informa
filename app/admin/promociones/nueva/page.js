import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SimpleContentForm from '@/components/admin/SimpleContentForm'
import { getAllNegociosAdmin } from '@/lib/data'

export default async function NuevaPromocionPage() {
  const negocios = await getAllNegociosAdmin()

  return (
    <div className="admin-page">
      <Link
        href="/admin/promociones"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a promociones
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">Nueva promoción</h1>
      <p className="mt-1 text-slate-600">Elegí el negocio y cargá el descuento.</p>
      <div className="mt-6">
        <SimpleContentForm type="promocion" negocios={negocios} />
      </div>
    </div>
  )
}
