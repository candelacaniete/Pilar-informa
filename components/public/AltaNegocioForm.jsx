'use client'

import { useMemo, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { CONTACT_WHATSAPP_DISPLAY, whatsappUrl } from '@/lib/whatsapp'

const PLANES = [
  {
    value: 'basico',
    label: 'Básico',
    hint: 'Ficha en la guía con datos esenciales.',
  },
  {
    value: 'destacado',
    label: 'Destacado',
    hint: 'Ficha en la guía, foto principal y visibilidad en búsquedas.',
  },
  {
    value: 'premium',
    label: 'Premium',
    hint: 'Más prioridad, galería de fotos y mayor presencia en home.',
  },
  {
    value: 'consultar',
    label: 'Quiero que me asesoren',
    hint: 'Todavía no sé qué plan me conviene.',
  },
]

const empty = {
  nombre: '',
  categoria: '',
  subcategoria: '',
  descripcion: '',
  direccion: '',
  localidad: '',
  telefono: '',
  whatsapp: '',
  instagram: '',
  web: '',
  horarios: '',
  plan: 'destacado',
  contactoNombre: '',
  contactoWhatsapp: '',
}

function buildMessage(form) {
  const planLabel = PLANES.find((p) => p.value === form.plan)?.label || form.plan
  const lines = [
    'Hola! Quiero sumar mi negocio a Guía Pilar.',
    '',
    '*Datos del negocio*',
    `• Nombre: ${form.nombre.trim()}`,
    `• Categoría: ${form.categoria.trim()}`,
  ]

  if (form.subcategoria.trim()) lines.push(`• Rubro / especialidad: ${form.subcategoria.trim()}`)
  if (form.descripcion.trim()) lines.push(`• Descripción: ${form.descripcion.trim()}`)
  if (form.direccion.trim()) lines.push(`• Dirección: ${form.direccion.trim()}`)
  if (form.localidad.trim()) lines.push(`• Localidad: ${form.localidad.trim()}`)
  if (form.telefono.trim()) lines.push(`• Teléfono: ${form.telefono.trim()}`)
  if (form.whatsapp.trim()) lines.push(`• WhatsApp del negocio: ${form.whatsapp.trim()}`)
  if (form.instagram.trim()) lines.push(`• Instagram: ${form.instagram.trim()}`)
  if (form.web.trim()) lines.push(`• Web: ${form.web.trim()}`)
  if (form.horarios.trim()) lines.push(`• Horarios: ${form.horarios.trim()}`)
  lines.push(`• Plan de interés: ${planLabel}`)
  lines.push('')
  lines.push('*Contacto*')
  lines.push(`• Nombre: ${form.contactoNombre.trim()}`)
  lines.push(`• WhatsApp: ${form.contactoWhatsapp.trim()}`)
  lines.push('')
  lines.push('Quedo atento/a para coordinar el alta. Gracias!')

  return lines.join('\n')
}

export default function AltaNegocioForm({ categorias = [] }) {
  const categoriasAbiertas = useMemo(
    () => (categorias || []).filter((c) => !c.cerrada),
    [categorias],
  )

  const [form, setForm] = useState({
    ...empty,
    categoria: categoriasAbiertas[0]?.nombre || '',
  })
  const [error, setError] = useState('')

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!form.nombre.trim()) {
      setError('Completá el nombre del negocio.')
      return
    }
    if (!form.categoria.trim()) {
      setError('Elegí una categoría.')
      return
    }
    if (!form.contactoNombre.trim()) {
      setError('Completá tu nombre de contacto.')
      return
    }
    if (!form.contactoWhatsapp.trim()) {
      setError('Completá un WhatsApp donde podamos responderte.')
      return
    }

    const url = whatsappUrl(buildMessage(form))
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none ring-teal/25 transition placeholder:text-muted/70 focus:border-teal focus:ring-2'
  const labelClass = 'mb-1.5 block text-sm font-medium text-ink-soft'

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-semibold text-ink">Datos del negocio</legend>

        <div>
          <label htmlFor="alta-nombre" className={labelClass}>
            Nombre del negocio *
          </label>
          <input
            id="alta-nombre"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            className={inputClass}
            placeholder="Ej: Casa Marea"
            required
            autoComplete="organization"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="alta-categoria" className={labelClass}>
              Categoría *
            </label>
            <select
              id="alta-categoria"
              value={form.categoria}
              onChange={(e) => set('categoria', e.target.value)}
              className={inputClass}
              required
            >
              {categoriasAbiertas.length === 0 ? (
                <option value="">Sin categorías</option>
              ) : (
                categoriasAbiertas.map((c) => (
                  <option key={c.id || c.slug} value={c.nombre}>
                    {c.icono ? `${c.icono} ` : ''}
                    {c.nombre}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label htmlFor="alta-subcategoria" className={labelClass}>
              Rubro / especialidad
            </label>
            <input
              id="alta-subcategoria"
              value={form.subcategoria}
              onChange={(e) => set('subcategoria', e.target.value)}
              className={inputClass}
              placeholder="Ej: Café & brunch"
            />
          </div>
        </div>

        <div>
          <label htmlFor="alta-descripcion" className={labelClass}>
            Descripción breve
          </label>
          <textarea
            id="alta-descripcion"
            value={form.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
            className={`${inputClass} min-h-[88px] resize-y`}
            placeholder="Contá en 1 o 2 oraciones qué ofrecés."
            maxLength={280}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="alta-direccion" className={labelClass}>
              Dirección
            </label>
            <input
              id="alta-direccion"
              value={form.direccion}
              onChange={(e) => set('direccion', e.target.value)}
              className={inputClass}
              placeholder="Calle y número"
              autoComplete="street-address"
            />
          </div>
          <div>
            <label htmlFor="alta-localidad" className={labelClass}>
              Localidad
            </label>
            <input
              id="alta-localidad"
              value={form.localidad}
              onChange={(e) => set('localidad', e.target.value)}
              className={inputClass}
              placeholder="Pilar Centro, Del Viso…"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="alta-telefono" className={labelClass}>
              Teléfono
            </label>
            <input
              id="alta-telefono"
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              className={inputClass}
              placeholder="11 5555-0101"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          <div>
            <label htmlFor="alta-whatsapp" className={labelClass}>
              WhatsApp del negocio
            </label>
            <input
              id="alta-whatsapp"
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              className={inputClass}
              placeholder="11 5555-0101"
              inputMode="tel"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="alta-instagram" className={labelClass}>
              Instagram
            </label>
            <input
              id="alta-instagram"
              value={form.instagram}
              onChange={(e) => set('instagram', e.target.value)}
              className={inputClass}
              placeholder="@tunegocio"
            />
          </div>
          <div>
            <label htmlFor="alta-web" className={labelClass}>
              Web
            </label>
            <input
              id="alta-web"
              value={form.web}
              onChange={(e) => set('web', e.target.value)}
              className={inputClass}
              placeholder="https://…"
              inputMode="url"
              autoComplete="url"
            />
          </div>
        </div>

        <div>
          <label htmlFor="alta-horarios" className={labelClass}>
            Horarios
          </label>
          <input
            id="alta-horarios"
            value={form.horarios}
            onChange={(e) => set('horarios', e.target.value)}
            className={inputClass}
            placeholder="Lun a Vie · 9:00 a 18:00"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-display text-xl font-semibold text-ink">Plan de interés</legend>
        <div className="grid gap-3">
          {PLANES.map((plan) => {
            const selected = form.plan === plan.value
            return (
              <label
                key={plan.value}
                className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition ${
                  selected
                    ? 'border-teal bg-teal-soft/60 ring-1 ring-teal/30'
                    : 'border-line bg-white hover:border-teal/40'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.value}
                  checked={selected}
                  onChange={() => set('plan', plan.value)}
                  className="mt-1 accent-teal"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">{plan.label}</span>
                  <span className="mt-0.5 block text-xs text-muted">{plan.hint}</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-semibold text-ink">Tu contacto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="alta-contacto-nombre" className={labelClass}>
              Tu nombre *
            </label>
            <input
              id="alta-contacto-nombre"
              value={form.contactoNombre}
              onChange={(e) => set('contactoNombre', e.target.value)}
              className={inputClass}
              placeholder="Cómo te llamás"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="alta-contacto-wa" className={labelClass}>
              WhatsApp para responderte *
            </label>
            <input
              id="alta-contacto-wa"
              value={form.contactoWhatsapp}
              onChange={(e) => set('contactoWhatsapp', e.target.value)}
              className={inputClass}
              placeholder="11 7373-9450"
              required
              inputMode="tel"
            />
          </div>
        </div>
      </fieldset>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-teal-dark sm:w-auto"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar por WhatsApp
        </button>
        <p className="text-xs leading-relaxed text-muted">
          Se abre WhatsApp con el mensaje listo para {CONTACT_WHATSAPP_DISPLAY}. Revisalo y tocá
          enviar. No se publica nada hasta que coordinemos el alta.
        </p>
      </div>
    </form>
  )
}
