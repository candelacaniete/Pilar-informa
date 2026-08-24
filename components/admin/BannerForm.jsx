'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  BANNER_PRECIO_CATEGORIA_ARS,
  BANNER_PRECIO_HOME_ARS,
  BANNER_SLOTS_CATEGORIA,
  BANNER_SLOTS_HOME,
  currentMonthStart,
  monthOptions,
} from '@/lib/banners'
import ImageUpload from './ImageUpload'
import { useToast } from './Toast'

export default function BannerForm({
  categoriasAbiertas = [],
  negocios = [],
  initial = null,
  defaultMes = null,
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const months = useMemo(() => monthOptions(8), [])

  const initialValues = useMemo(() => {
    if (!initial) {
      return {
        ubicacion: 'home',
        categoria_id: categoriasAbiertas[0]?.id || '',
        slot: '1',
        mes: defaultMes || currentMonthStart(),
        imagen_url: '',
        link_url: '',
        negocio_id: '',
        titulo: '',
        notas: '',
        activo: true,
      }
    }
    return {
      ubicacion: initial.ubicacion || 'home',
      categoria_id: initial.categoria_id || categoriasAbiertas[0]?.id || '',
      slot: String(initial.slot || 1),
      mes: initial.mes || currentMonthStart(),
      imagen_url: initial.imagen_url || '',
      link_url: initial.link_url || '',
      negocio_id: initial.negocio_id || '',
      titulo: initial.titulo || '',
      notas: initial.notas || '',
      activo: initial.activo !== false,
    }
  }, [initial, categoriasAbiertas, defaultMes])

  const [form, setForm] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const maxSlot = form.ubicacion === 'home' ? BANNER_SLOTS_HOME : BANNER_SLOTS_CATEGORIA
  const precio =
    form.ubicacion === 'home' ? BANNER_PRECIO_HOME_ARS : BANNER_PRECIO_CATEGORIA_ARS

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!form.imagen_url || !form.link_url) {
      showToast('Imagen y link son obligatorios', 'error')
      return
    }
    setSaving(true)

    const payload = {
      ubicacion: form.ubicacion,
      categoria_id: form.ubicacion === 'categoria' ? form.categoria_id : null,
      slot: Number(form.slot),
      mes: form.mes,
      imagen_url: form.imagen_url,
      link_url: form.link_url.trim(),
      negocio_id: form.negocio_id || null,
      titulo: form.titulo.trim() || null,
      precio_ars: precio,
      notas: form.notas.trim() || null,
      activo: Boolean(form.activo),
    }

    try {
      if (!isSupabaseConfigured()) {
        showToast('Modo demo: configurá Supabase para guardar banners', 'error')
        return
      }
      const supabase = createClient()
      if (initial?.id) {
        const { error } = await supabase.from('banners').update(payload).eq('id', initial.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('banners').insert(payload)
        if (error) throw error
      }
      showToast(initial ? 'Banner actualizado' : 'Banner creado')
      router.push(`/admin/banners?mes=${form.mes}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      showToast(err.message || 'No se pudo guardar el banner', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ubicación</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { value: 'home', label: `Home (4 slots · $${BANNER_PRECIO_HOME_ARS.toLocaleString('es-AR')})` },
            {
              value: 'categoria',
              label: `Categoría (2 slots · $${BANNER_PRECIO_CATEGORIA_ARS.toLocaleString('es-AR')})`,
            },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                set('ubicacion', opt.value)
                set('slot', '1')
              }}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                form.ubicacion === opt.value
                  ? 'border-teal bg-teal text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Tecnología (cerrada) no tiene slots pagos. Cobro manual por WhatsApp / MercadoPago.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Mes calendario
          <select
            value={form.mes}
            onChange={(e) => set('mes', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Slot
          <select
            value={form.slot}
            onChange={(e) => set('slot', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            {Array.from({ length: maxSlot }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Espacio {n}
              </option>
            ))}
          </select>
        </label>

        {form.ubicacion === 'categoria' ? (
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Categoría (solo abiertas)
            <select
              required
              value={form.categoria_id}
              onChange={(e) => set('categoria_id', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              {categoriasAbiertas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Negocio asociado (opcional)
          <select
            value={form.negocio_id}
            onChange={(e) => set('negocio_id', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">Sin negocio</option>
            {negocios.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Título (opcional)
          <input
            value={form.titulo}
            onChange={(e) => set('titulo', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="Ej: Promo Casa Marea"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Link de destino
          <input
            required
            value={form.link_url}
            onChange={(e) => set('link_url', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="/negocio/casa-marea o https://..."
          />
        </label>

        <div className="sm:col-span-2">
          <ImageUpload
            label="Imagen del banner"
            folder="banners"
            value={form.imagen_url}
            onChange={(url) => set('imagen_url', url)}
          />
        </div>

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Notas internas
          <textarea
            value={form.notas}
            onChange={(e) => set('notas', e.target.value)}
            rows={2}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => set('activo', e.target.checked)}
            className="rounded border-slate-300"
          />
          Activo
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
      >
        {saving ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear banner'}
      </button>
    </form>
  )
}
