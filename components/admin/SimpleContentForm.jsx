'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import ImageUpload from './ImageUpload'
import { useToast } from './Toast'

/**
 * Formulario genérico simple para noticias / eventos / promociones
 * type: 'noticia' | 'evento' | 'promocion'
 */
export default function SimpleContentForm({ type, initial = null, negocios = [] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const defaults = useMemo(() => getDefaults(type, initial, negocios), [type, initial, negocios])
  const [form, setForm] = useState(defaults)
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(Boolean(initial))

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const listPath =
    type === 'noticia' ? '/admin/noticias' : type === 'evento' ? '/admin/eventos' : '/admin/promociones'

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (!isSupabaseConfigured()) {
        showToast('Guardado en modo demo (sin base de datos)')
        router.push(listPath)
        return
      }

      const supabase = createClient()
      const table = type === 'noticia' ? 'noticias' : type === 'evento' ? 'eventos' : 'promociones'
      const payload = buildPayload(type, form)

      if (initial?.id) {
        const { error } = await supabase.from(table).update(payload).eq('id', initial.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from(table).insert(payload)
        if (error) throw error
      }

      showToast(
        type === 'noticia'
          ? 'Noticia guardada correctamente'
          : type === 'evento'
            ? 'Evento guardado correctamente'
            : 'Promoción guardada correctamente',
      )
      router.push(listPath)
      router.refresh()
    } catch (err) {
      console.error(err)
      showToast('No se pudo guardar. Revisá los datos.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      {type !== 'promocion' && (
        <>
          <Field label="Título">
            <input
              required
              value={form.titulo}
              onChange={(e) => {
                set('titulo', e.target.value)
                if (!slugTouched) set('slug', slugify(e.target.value))
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Link corto (slug)">
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
        </>
      )}

      {type === 'promocion' && (
        <>
          <Field label="Negocio">
            <select
              required
              value={form.negocio_id}
              onChange={(e) => set('negocio_id', e.target.value)}
              className={inputClass}
            >
              <option value="">Elegí un negocio…</option>
              {negocios.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Título de la promoción">
            <input
              required
              value={form.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              className={inputClass}
              placeholder="20% OFF en Casa Marea"
            />
          </Field>
          <Field label="Descuento" hint="Ej: 20% OFF, 2x1">
            <input value={form.descuento} onChange={(e) => set('descuento', e.target.value)} className={inputClass} />
          </Field>
        </>
      )}

      {type === 'noticia' && (
        <>
          <Field label="Bajada / resumen">
            <textarea
              rows={2}
              value={form.bajada}
              onChange={(e) => set('bajada', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Cuerpo de la noticia">
            <textarea
              rows={8}
              value={form.cuerpo}
              onChange={(e) => set('cuerpo', e.target.value)}
              className={inputClass}
              placeholder="Escribí la noticia acá…"
            />
          </Field>
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Categoría">
              <input value={form.categoria} onChange={(e) => set('categoria', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Autor">
              <input value={form.autor} onChange={(e) => set('autor', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Estado">
              <select value={form.estado} onChange={(e) => set('estado', e.target.value)} className={inputClass}>
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
            </Field>
            <Field label="Fecha de publicación">
              <input
                type="datetime-local"
                value={form.publicado_en}
                onChange={(e) => set('publicado_en', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </>
      )}

      {type === 'evento' && (
        <>
          <Field label="Descripción">
            <textarea
              rows={4}
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Fecha">
              <input
                type="date"
                required
                value={form.fecha}
                onChange={(e) => set('fecha', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Hora">
              <input value={form.hora} onChange={(e) => set('hora', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Ubicación">
              <input value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Localidad">
              <input value={form.localidad} onChange={(e) => set('localidad', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Categoría">
              <input value={form.categoria} onChange={(e) => set('categoria', e.target.value)} className={inputClass} />
            </Field>
          </div>
        </>
      )}

      {type === 'promocion' && (
        <>
          <Field label="Descripción">
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Válido desde">
              <input
                type="date"
                value={form.valido_desde}
                onChange={(e) => set('valido_desde', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Válido hasta">
              <input
                type="date"
                value={form.valido_hasta}
                onChange={(e) => set('valido_hasta', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Estado">
              <select value={form.estado} onChange={(e) => set('estado', e.target.value)} className={inputClass}>
                <option value="activa">Activa</option>
                <option value="pausada">Pausada</option>
                <option value="vencida">Vencida</option>
              </select>
            </Field>
          </div>
        </>
      )}

      <ImageUpload
        label="Imagen"
        folder={type === 'noticia' ? 'noticias' : type === 'evento' ? 'eventos' : 'promociones'}
        value={form.imagen}
        onChange={(url) => set('imagen', url)}
      />

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push(listPath)}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

const inputClass =
  'box-border w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'

function getDefaults(type, initial, negocios) {
  if (type === 'noticia') {
    return {
      titulo: initial?.titulo || '',
      slug: initial?.slug || '',
      bajada: initial?.bajada || '',
      cuerpo: initial?.cuerpo || '',
      imagen: initial?.imagen || '',
      categoria: initial?.categoria || 'Ciudad',
      autor: initial?.autor || 'Redacción Pilar Informa',
      estado: initial?.estado || 'borrador',
      publicado_en: initial?.publicado_en
        ? String(initial.publicado_en).slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    }
  }
  if (type === 'evento') {
    return {
      titulo: initial?.titulo || '',
      slug: initial?.slug || '',
      fecha: initial?.fecha || '',
      hora: initial?.hora || '',
      ubicacion: initial?.ubicacion || '',
      localidad: initial?.localidad || '',
      descripcion: initial?.descripcion || '',
      categoria: initial?.categoria || '',
      imagen: initial?.imagen || '',
    }
  }
  return {
    negocio_id: initial?.negocio_id || negocios[0]?.id || '',
    titulo: initial?.titulo || '',
    descuento: initial?.descuento || '',
    descripcion: initial?.descripcion || '',
    imagen: initial?.imagen || '',
    valido_desde: initial?.valido_desde || '',
    valido_hasta: initial?.valido_hasta || '',
    estado: initial?.estado || 'activa',
  }
}

function buildPayload(type, form) {
  if (type === 'noticia') {
    return {
      titulo: form.titulo.trim(),
      slug: slugify(form.slug || form.titulo),
      bajada: form.bajada || null,
      cuerpo: form.cuerpo || null,
      imagen: form.imagen || null,
      categoria: form.categoria || null,
      autor: form.autor || null,
      estado: form.estado,
      publicado_en: form.publicado_en ? new Date(form.publicado_en).toISOString() : null,
    }
  }
  if (type === 'evento') {
    return {
      titulo: form.titulo.trim(),
      slug: slugify(form.slug || form.titulo),
      fecha: form.fecha,
      hora: form.hora || null,
      ubicacion: form.ubicacion || null,
      localidad: form.localidad || null,
      descripcion: form.descripcion || null,
      categoria: form.categoria || null,
      imagen: form.imagen || null,
    }
  }
  return {
    negocio_id: form.negocio_id,
    titulo: form.titulo.trim(),
    descuento: form.descuento || null,
    descripcion: form.descripcion || null,
    imagen: form.imagen || null,
    valido_desde: form.valido_desde || null,
    valido_hasta: form.valido_hasta || null,
    estado: form.estado,
  }
}
