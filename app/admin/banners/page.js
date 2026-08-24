import Link from 'next/link'
import { Plus } from 'lucide-react'
import {
  getAllBannersAdmin,
  getAllNegociosAdmin,
  getCategoriasConBanners,
} from '@/lib/data'
import {
  BANNER_PRECIO_CATEGORIA_ARS,
  BANNER_PRECIO_HOME_ARS,
  BANNER_SLOTS_CATEGORIA,
  BANNER_SLOTS_HOME,
  currentMonthStart,
  emptyCategoriaSlots,
  emptyHomeSlots,
  formatMonthLabel,
  monthOptions,
} from '@/lib/banners'

export default async function AdminBannersPage({ searchParams }) {
  const params = await searchParams
  const mes = params?.mes || currentMonthStart()
  const [banners, categorias, negocios] = await Promise.all([
    getAllBannersAdmin({ mes }),
    getCategoriasConBanners(),
    getAllNegociosAdmin(),
  ])

  const homeFilled = banners.filter((b) => b.ubicacion === 'home' && b.activo)
  const homeSlots = emptyHomeSlots(homeFilled)

  return (
    <div className="admin-page space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Banners</h1>
          <p className="mt-1 text-slate-600">
            Home: {BANNER_SLOTS_HOME} espacios · $
            {BANNER_PRECIO_HOME_ARS.toLocaleString('es-AR')}/mes. Categoría: {BANNER_SLOTS_CATEGORIA}{' '}
            · ${BANNER_PRECIO_CATEGORIA_ARS.toLocaleString('es-AR')}/mes. Tecnología: sin slots
            pagos.
          </p>
        </div>
        <Link
          href={`/admin/banners/nuevo?mes=${mes}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Plus className="h-4 w-4" />
          Nuevo banner
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-slate-700">
          Mes
          <select
            name="mes"
            defaultValue={mes}
            className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
          >
            {monthOptions(8).map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Ver mes
        </button>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Home — {formatMonthLabel(mes)}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {homeSlots.map(({ slot, banner }) => (
            <SlotCard key={`home-${slot}`} slot={slot} banner={banner} mes={mes} label="Home" />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Por categoría</h2>
        {categorias.map((cat) => {
          const filled = banners.filter(
            (b) => b.ubicacion === 'categoria' && b.categoria_id === cat.id && b.activo,
          )
          const slots = emptyCategoriaSlots(filled)
          return (
            <div key={cat.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-slate-900">
                {cat.icono} {cat.nombre}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {slots.map(({ slot, banner }) => (
                  <SlotCard
                    key={`${cat.id}-${slot}`}
                    slot={slot}
                    banner={banner}
                    mes={mes}
                    label={cat.nombre}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <p className="text-xs text-slate-500">
        {negocios.length} negocios en catálogo (referencia para asociar banners).
      </p>
    </div>
  )
}

function SlotCard({ slot, banner, mes, label }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label} · Slot {slot}
      </p>
      {banner ? (
        <div className="mt-2 space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner.imagen_url} alt="" className="aspect-[16/7] w-full rounded-lg object-cover" />
          <p className="truncate text-sm font-medium text-slate-800">
            {banner.titulo || banner.negocios?.nombre || banner.link_url}
          </p>
          <Link
            href={`/admin/banners/${banner.id}`}
            className="text-sm font-semibold text-teal hover:text-teal-dark"
          >
            Editar
          </Link>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-slate-500">Vacío (house en la web)</p>
          <Link
            href={`/admin/banners/nuevo?mes=${mes}`}
            className="mt-1 inline-flex text-sm font-semibold text-teal"
          >
            Asignar
          </Link>
        </div>
      )}
    </div>
  )
}
