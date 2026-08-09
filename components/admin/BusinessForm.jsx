'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { horariosTexto, slugify } from '@/lib/utils'
import ImageUpload from './ImageUpload'
import { useToast } from './Toast'

const empty = {
  nombre: '',
  slug: '',
  categoria_id: '',
  subcategoria: '',
  descripcion_corta: '',
  descripcion_larga: '',
  direccion: '',
  localidad: '',
  lat: '',
  lng: '',
  telefono: '',
  whatsapp: '',
  instagram: '',
  web: '',
  horarios_texto: '',
  rating: '0',
  cantidad_opiniones: '0',
  estado: 'activo',
  plan: 'destacado',
  fecha_pago: '',
  plan_vence: '',
  verificado: true,
  foto: '',
}

export default function BusinessForm({ categorias = [], initial = null }) {
  const router = useRouter()
  const { showToast } = useToast()
  const initialValues = useMemo(() => {
    if (!initial) return { ...empty, categoria_id: categorias[0]?.id || '' }
    const foto =
      initial.negocio_fotos?.find((f) => f.es_principal)?.url ||
      initial.negocio_fotos?.[0]?.url ||
      ''
    return {
      ...empty,
      ...initial,
      lat: initial.lat ?? '',
      lng: initial.lng ?? '',
      rating: String(initial.rating ?? 0),
      cantidad_opiniones: String(initial.cantidad_opiniones ?? 0),
      fecha_pago: initial.fecha_pago || '',
      plan_vence: initial.plan_vence ? String(initial.plan_vence).slice(0, 10) : '',
      horarios_texto: horariosTexto(initial.horarios),
      foto,
    }
  }, [initial, categorias])

  const [form, setForm] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(Boolean(initial))

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onNombre = (value) => {
    set('nombre', value)
    if (!slugTouched) set('slug', slugify(value))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      nombre: form.nombre.trim(),
      slug: slugify(form.slug || form.nombre),
      categoria_id: form.categoria_id,
      subcategoria: form.subcategoria || null,
      descripcion_corta: form.descripcion_corta || null,
      descripcion_larga: form.descripcion_larga || null,
      direccion: form.direccion || null,
      localidad: form.localidad || null,
      lat: form.lat === '' ? null : Number(form.lat),
      lng: form.lng === '' ? null : Number(form.lng),
      telefono: form.telefono || null,
      whatsapp: form.whatsapp || null,
      instagram: form.instagram || null,
      web: form.web || null,
      horarios: { texto: form.horarios_texto || '' },
      rating: Number(form.rating || 0),
      cantidad_opiniones: Number(form.cantidad_opiniones || 0),
      estado: form.estado,
      plan: form.plan,
      fecha_pago: form.fecha_pago || null,
      plan_vence: form.plan_vence ? new Date(form.plan_vence).toISOString() : null,
      verificado: Boolean(form.verificado),
    }

    try {
      if (!isSupabaseConfigured()) {
        showToast('Negocio guardado en modo demo (sin base de datos)')
        router.push('/admin/negocios')
        return
      }

      const supabase = createClient()
      let negocioId = initial?.id

      if (initial?.id) {
        const { error } = await supabase.from('negocios').update(payload).eq('id', initial.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('negocios').insert(payload).select('id').single()
        if (error) throw error
        negocioId = data.id
      }

      if (form.foto && negocioId) {
        // Reemplazar foto principal
        await supabase.from('negocio_fotos').delete().eq('negocio_id', negocioId)
        const { error: fotoError } = await supabase.from('negocio_fotos').insert({
          negocio_id: negocioId,
          url: form.foto,
          orden: 0,
          es_principal: true,
        })
        if (fotoError) throw fotoError
      }

      showToast(initial ? 'Cambios guardados correctamente' : 'Negocio publicado correctamente')
      router.push('/admin/negocios')
      router.refresh()
    } catch (err) {
      console.error(err)
      showToast('No se pudo guardar. Revisá los datos e intentá de nuevo.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full min-w-0 max-w-full space-y-6">
      <Section title="Datos básicos" subtitle="Lo primero que ve la gente en la guía.">
        <Field label="Nombre del negocio">
          <input
            required
            value={form.nombre}
            onChange={(e) => onNombre(e.target.value)}
            className={inputClass}
            placeholder="Ej: Casa Marea"
          />
        </Field>
        <Field label="Dirección web corta (slug)" hint="Se usa en el link del perfil. Ej: casa-marea">
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              set('slug', slugify(e.target.value))
            }}
            className={inputClass}
          />
        </Field>
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Categoría">
            <select
              required
              value={form.categoria_id}
              onChange={(e) => set('categoria_id', e.target.value)}
              className={inputClass}
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subcategoría" hint="Ej: Café & brunch">
            <input
              value={form.subcategoria}
              onChange={(e) => set('subcategoria', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Descripción corta" hint="Una o dos oraciones.">
          <textarea
            rows={2}
            value={form.descripcion_corta}
            onChange={(e) => set('descripcion_corta', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Descripción larga">
          <textarea
            rows={5}
            value={form.descripcion_larga}
            onChange={(e) => set('descripcion_larga', e.target.value)}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Ubicación" subtitle="Para el perfil y el mapa.">
        <Field label="Dirección">
          <input
            value={form.direccion}
            onChange={(e) => set('direccion', e.target.value)}
            className={inputClass}
            placeholder="Calle y número"
          />
        </Field>
        <Field label="Localidad">
          <input
            value={form.localidad}
            onChange={(e) => set('localidad', e.target.value)}
            className={inputClass}
            placeholder="Pilar Centro, Del Viso…"
          />
        </Field>
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Latitud" hint="Opcional, para el mapa">
            <input
              value={form.lat}
              onChange={(e) => set('lat', e.target.value)}
              className={inputClass}
              placeholder="-34.4587"
            />
          </Field>
          <Field label="Longitud" hint="Opcional, para el mapa">
            <input
              value={form.lng}
              onChange={(e) => set('lng', e.target.value)}
              className={inputClass}
              placeholder="-58.9142"
            />
          </Field>
        </div>
      </Section>

      <Section title="Contacto" subtitle="Cómo te pueden escribir o encontrar.">
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Teléfono">
            <input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} className={inputClass} />
          </Field>
          <Field label="WhatsApp">
            <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Instagram">
            <input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Sitio web">
            <input value={form.web} onChange={(e) => set('web', e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Horarios">
          <input
            value={form.horarios_texto}
            onChange={(e) => set('horarios_texto', e.target.value)}
            className={inputClass}
            placeholder="Lun a Vie · 9:00 a 18:00"
          />
        </Field>
      </Section>

      <Section title="Fotos" subtitle="Una foto principal clara ayuda mucho.">
        <ImageUpload
          label="Foto principal"
          folder="negocios"
          value={form.foto}
          onChange={(url) => set('foto', url)}
        />
      </Section>

      <Section title="Plan y pago" subtitle="Todos los negocios pagan para aparecer. No hay plan gratis.">
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Plan">
            <select value={form.plan} onChange={(e) => set('plan', e.target.value)} className={inputClass}>
              <option value="destacado">Destacado</option>
              <option value="premium">Premium</option>
            </select>
          </Field>
          <Field label="Estado">
            <select value={form.estado} onChange={(e) => set('estado', e.target.value)} className={inputClass}>
              <option value="activo">Activo (se ve en la web)</option>
              <option value="pausado">Pausado (oculto)</option>
              <option value="vencido">Vencido</option>
            </select>
          </Field>
          <Field label="Fecha de pago">
            <input
              type="date"
              value={form.fecha_pago}
              onChange={(e) => set('fecha_pago', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="El plan vence el">
            <input
              type="date"
              value={form.plan_vence}
              onChange={(e) => set('plan_vence', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.verificado}
            onChange={(e) => set('verificado', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal"
          />
          Marcar como verificado
        </label>
      </Section>

      <div className="sticky bottom-0 border-t border-slate-200 bg-slate-100/95 py-4 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/negocios')}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 md:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60 md:w-auto"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-5 min-w-0 space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      <div className="mt-1.5 min-w-0">{children}</div>
    </label>
  )
}

const inputClass =
  'box-border w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'
