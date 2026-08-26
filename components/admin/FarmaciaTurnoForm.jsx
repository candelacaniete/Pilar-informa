'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { ZONAS_PILAR } from '@/lib/zonas'
import { useToast } from './Toast'

export default function FarmaciaTurnoForm({ initial = null }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nombre: initial?.nombre || '',
    direccion: initial?.direccion || '',
    localidad: initial?.localidad || 'Pilar Centro',
    telefono: initial?.telefono || '',
    whatsapp: initial?.whatsapp || '',
    fecha: initial?.fecha || new Date().toISOString().slice(0, 10),
    horario: initial?.horario || '8:00 a 22:00',
    maps_url: initial?.maps_url || '',
    notas: initial?.notas || '',
  })

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (!isSupabaseConfigured()) {
        showToast('Guardado en modo demo (sin base de datos)')
        router.push('/admin/farmacias')
        return
      }

      const supabase = createClient()
      const payload = {
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim() || null,
        localidad: form.localidad,
        telefono: form.telefono.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        fecha: form.fecha,
        horario: form.horario.trim() || '8:00 a 22:00',
        maps_url: form.maps_url.trim() || null,
        notas: form.notas.trim() || null,
        fuente: 'manual',
      }

      if (initial?.id) {
        const { error } = await supabase.from('farmacias_turno').update(payload).eq('id', initial.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('farmacias_turno').insert(payload)
        if (error) throw error
      }

      showToast('Turno de farmacia guardado')
      router.push('/admin/farmacias')
      router.refresh()
    } catch (err) {
      console.error(err)
      showToast('No se pudo guardar. Revisá los datos.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
    >
      <p className="text-sm text-slate-600">
        Cargá una farmacia por día y zona. Los turnos manuales no los borra el scrape de Colfarma.
      </p>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Nombre de la farmacia</span>
        <input
          required
          value={form.nombre}
          onChange={(e) => set('nombre', e.target.value)}
          className={inputClass}
          placeholder="Farmacia Santa Rita"
        />
      </label>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Zona</span>
          <select
            required
            value={form.localidad}
            onChange={(e) => set('localidad', e.target.value)}
            className={inputClass}
          >
            {ZONAS_PILAR.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Día de turno</span>
          <input
            type="date"
            required
            value={form.fecha}
            onChange={(e) => set('fecha', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Horario</span>
          <input
            required
            value={form.horario}
            onChange={(e) => set('horario', e.target.value)}
            className={inputClass}
            placeholder="8:00 a 22:00 o 24 horas"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Teléfono</span>
          <input
            value={form.telefono}
            onChange={(e) => set('telefono', e.target.value)}
            className={inputClass}
            placeholder="+54 230 444-0000"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Dirección</span>
        <input
          value={form.direccion}
          onChange={(e) => set('direccion', e.target.value)}
          className={inputClass}
          placeholder="Calle y número"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Link de Google Maps (opcional)</span>
        <input
          value={form.maps_url}
          onChange={(e) => set('maps_url', e.target.value)}
          className={inputClass}
          placeholder="https://www.google.com/maps?q=..."
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">WhatsApp</span>
        <input
          value={form.whatsapp}
          onChange={(e) => set('whatsapp', e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Notas (opcional)</span>
        <textarea
          rows={3}
          value={form.notas}
          onChange={(e) => set('notas', e.target.value)}
          className={inputClass}
          placeholder="Ej: entrega de recetas hasta las 22 hs."
        />
      </label>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push('/admin/farmacias')}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Guardar turno'}
        </button>
      </div>
    </form>
  )
}

const inputClass =
  'box-border w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'
