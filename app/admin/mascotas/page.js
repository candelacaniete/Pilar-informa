import { getAllMascotasAvisosAdmin } from '@/lib/data'
import MascotasAdminList from '@/components/admin/MascotasAdminList'

export default async function AdminMascotasPage() {
  const avisos = await getAllMascotasAvisosAdmin()
  const pendientes = avisos.filter((a) => a.estado === 'pendiente').length

  return (
    <div className="admin-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Mascotas</h1>
        <p className="mt-1 text-slate-600">
          Moderación de avisos de mascotas perdidas y encontradas. Los pendientes aparecen primero.
        </p>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {avisos.length} {avisos.length === 1 ? 'aviso' : 'avisos'}
        {pendientes ? (
          <span className="ml-2 font-semibold text-amber-800">
            · {pendientes} pendiente{pendientes === 1 ? '' : 's'}
          </span>
        ) : null}
      </p>

      <MascotasAdminList avisos={avisos} />
    </div>
  )
}
