import { getPromociones } from '@/lib/data'
import PromoGrid from '@/components/public/PromoGrid'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata = buildPageMetadata({
  title: 'Promociones de comercios en Pilar',
  description:
    'Descuentos y beneficios de comercios locales de Pilar. Presentá la promo desde Guía Pilar.',
  path: '/promociones',
})

export default async function PromocionesPage() {
  const promociones = await getPromociones()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Beneficios</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Promociones en Pilar
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Descuentos y beneficios de comercios locales. Presentá la promo desde Guía Pilar.
        </p>
      </div>

      <div className="mt-10">
        <PromoGrid
          promociones={promociones}
          minSlots={promociones.length ? promociones.length : 3}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </div>
  )
}
