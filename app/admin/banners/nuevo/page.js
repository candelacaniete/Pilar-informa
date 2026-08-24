import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BannerForm from '@/components/admin/BannerForm'
import { getAllNegociosAdmin, getCategoriasConBanners } from '@/lib/data'
import { currentMonthStart } from '@/lib/banners'

export default async function NuevoBannerPage({ searchParams }) {
  const params = await searchParams
  const [categorias, negocios] = await Promise.all([
    getCategoriasConBanners(),
    getAllNegociosAdmin(),
  ])

  return (
    <div className="admin-page">
      <Link
        href="/admin/banners"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a banners
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Nuevo banner</h1>
      <p className="mt-1 text-slate-600">Asignación manual por mes calendario.</p>
      <div className="mt-6">
        <BannerForm
          categoriasAbiertas={categorias}
          negocios={negocios}
          defaultMes={params?.mes || currentMonthStart()}
        />
      </div>
    </div>
  )
}
