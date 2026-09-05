'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { ZONAS_PILAR } from '@/lib/zonas'
import { MASCOTA_TITULO_MAX, isValidWhatsappAr } from '@/lib/mascotas/utils'

const empty = {
  titulo: '',
  tipo: 'perdido',
  zona: '',
  whatsapp: '',
  fecha_hecho: '',
}

export default function MascotaAvisoForm() {
  const [form, setForm] = useState(empty)
  const [preview, setPreview] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onPickFile = (picked) => {
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      setError('Solo se pueden subir imágenes.')
      return
    }
    if (picked.size > 5 * 1024 * 1024) {
      setError('La foto no puede superar 5 MB.')
      return
    }
    setError('')
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!file) {
      setError('La foto es obligatoria.')
      return
    }
    if (!form.titulo.trim() || form.titulo.trim().length < 3) {
      setError('Escribí un título corto (mínimo 3 caracteres).')
      return
    }
    if (form.titulo.trim().length > MASCOTA_TITULO_MAX) {
      setError(`El título puede tener hasta ${MASCOTA_TITULO_MAX} caracteres.`)
      return
    }
    if (!form.zona) {
      setError('Elegí una zona.')
      return
    }
    if (!isValidWhatsappAr(form.whatsapp)) {
      setError('El WhatsApp no es válido. Usá un celular argentino (ej. 11 1234-5678).')
      return
    }

    setSubmitting(true)
    try {
      const body = new FormData()
      body.set('titulo', form.titulo.trim())
      body.set('tipo', form.tipo)
      body.set('zona', form.zona)
      body.set('whatsapp', form.whatsapp.trim())
      if (form.fecha_hecho) body.set('fecha_hecho', form.fecha_hecho)
      body.set('foto', file)

      const res = await fetch('/api/mascotas', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setError(data.error || 'No pudimos publicar el aviso.')
        return
      }
      setResult(data)
    } catch {
      setError('Error de red. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-teal/30 bg-teal-soft/40 px-5 py-8 text-center md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">En revisión</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">
          Tu aviso está en revisión
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted md:text-base">
          Lo revisamos antes de publicarlo. Guardá este link para marcar el aviso como resuelto
          cuando encuentres a tu mascota (o al dueño):
        </p>
        {result.manageUrl ? (
          <p className="mx-auto mt-4 max-w-lg break-all rounded-xl bg-white px-4 py-3 text-left text-sm text-teal-dark">
            <Link href={result.manageUrl} className="font-semibold underline-offset-2 hover:underline">
              {result.manageUrl}
            </Link>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/mascotas"
            className="inline-flex rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
          >
            Volver al listado
          </Link>
          <button
            type="button"
            onClick={() => {
              setResult(null)
              setForm(empty)
              setFile(null)
              setPreview('')
            }}
            className="inline-flex rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-ink hover:border-teal"
          >
            Publicar otro
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-sm md:p-7">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Foto (obligatoria)</p>
        {preview ? (
          <div className="relative overflow-hidden rounded-xl border border-line bg-paper-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Vista previa" className="h-52 w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setPreview('')
              }}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink shadow"
              aria-label="Quitar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-paper-deep/50 px-4 py-10 text-center hover:border-teal/50"
          >
            <ImagePlus className="h-6 w-6 text-muted" />
            <span className="text-sm font-medium text-ink">Elegí una foto</span>
            <span className="text-xs text-muted">JPG, PNG o WebP · máx. 5 MB</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0])}
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">
          Título corto <span className="text-muted">({form.titulo.length}/{MASCOTA_TITULO_MAX})</span>
        </span>
        <input
          type="text"
          maxLength={MASCOTA_TITULO_MAX}
          value={form.titulo}
          onChange={(e) => setField('titulo', e.target.value)}
          placeholder="Ej. Luna, labrador chocolate"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none ring-teal/30 focus:ring-2"
          required
        />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Estado</legend>
        <div className="flex flex-wrap gap-3">
          {[
            { value: 'perdido', label: 'Perdido' },
            { value: 'encontrado', label: 'Encontrado' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                form.tipo === opt.value
                  ? 'border-teal bg-teal-soft text-teal-dark'
                  : 'border-line bg-white text-ink'
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={opt.value}
                checked={form.tipo === opt.value}
                onChange={() => setField('tipo', opt.value)}
                className="accent-teal"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Zona</span>
        <select
          value={form.zona}
          onChange={(e) => setField('zona', e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none ring-teal/30 focus:ring-2"
          required
        >
          <option value="">Elegí una zona</option>
          {ZONAS_PILAR.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">WhatsApp de contacto</span>
        <input
          type="tel"
          value={form.whatsapp}
          onChange={(e) => setField('whatsapp', e.target.value)}
          placeholder="11 1234-5678"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none ring-teal/30 focus:ring-2"
          required
        />
        <span className="mt-1.5 block text-xs text-muted">
          Se muestra solo como botón “Contactar por WhatsApp”, nunca el número en texto.
        </span>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">
          Fecha del hecho <span className="font-normal text-muted">(opcional)</span>
        </span>
        <input
          type="date"
          value={form.fecha_hecho}
          onChange={(e) => setField('fecha_hecho', e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none ring-teal/30 focus:ring-2"
        />
      </label>

      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? 'Enviando…' : 'Enviar aviso'}
      </button>
    </form>
  )
}
