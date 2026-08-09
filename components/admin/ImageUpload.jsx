'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from './Toast'

export default function ImageUpload({ value, onChange, folder = 'general', label = 'Foto' }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()

  const uploadFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Solo se pueden subir imágenes', 'error')
      return
    }

    const supabase = createClient()
    if (!supabase) {
      // Modo demo sin Supabase: preview local
      const localUrl = URL.createObjectURL(file)
      onChange(localUrl)
      showToast('Vista previa lista (modo demo sin Supabase)')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (error) throw error
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      onChange(data.publicUrl)
      showToast('Imagen subida correctamente')
    } catch (err) {
      console.error(err)
      showToast('No se pudo subir la imagen. Revisá el bucket “media”.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    uploadFile(file)
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Vista previa" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow"
            aria-label="Quitar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
            dragging
              ? 'border-teal bg-teal-soft/40'
              : 'border-slate-300 bg-slate-50 hover:border-teal/50 hover:bg-white'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-teal" />
          ) : (
            <ImagePlus className="h-6 w-6 text-slate-500" />
          )}
          <span className="text-sm font-medium text-slate-700">
            {uploading ? 'Subiendo…' : 'Arrastrá una imagen acá o hacé clic para elegir'}
          </span>
          <span className="text-xs text-slate-500">JPG o PNG</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => uploadFile(e.target.files?.[0])}
      />
    </div>
  )
}
