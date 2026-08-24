import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import BannerForm from '@/components/admin/BannerForm'
import { getAllNegociosAdmin, getBannerAdminById, getCategoriasConBanners } from '@/lib/data'

export default async function EditarBannerPage({ params }) {
  const { id } = await params
  const [banner, categorias, negocios] = await Promise.all([
    getBannerAdminById(id),
    getCategoriasConBanners(),
    getAllNegociosAdmin(),
  ])
  if (!banner) notFound()

  return (
    <div className="admin-page">
      <Link
        href="/admin/banners"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a banners
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Editar banner</h1>
      <div className="mt-6">
        <BannerForm categoriasAbiertas={categorias} negocios={negocios} initial={banner} />
      </div>
    </div>
  )
}
