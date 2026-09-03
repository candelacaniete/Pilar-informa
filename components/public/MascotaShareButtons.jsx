'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { buildMascotaShareText, mascotaWhatsappUrl } from '@/lib/mascotas/utils'

export default function MascotaShareButtons({ titulo, tipo, zona, url }) {
  const [copied, setCopied] = useState(false)
  const text = useMemo(
    () => buildMascotaShareText({ titulo, tipo, zona, url }),
    [titulo, tipo, zona, url],
  )

  const waShare = mascotaWhatsappUrl('', text) || `https://wa.me/?text=${encodeURIComponent(text)}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyLink()
      return
    }
    try {
      await navigator.share({ title: titulo, text, url })
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={waShare}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
      >
        <Share2 className="h-4 w-4" />
        WhatsApp
      </a>
      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-teal hover:text-teal"
      >
        <Share2 className="h-4 w-4" />
        Instagram / compartir
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-teal hover:text-teal"
      >
        {copied ? <Check className="h-4 w-4 text-teal" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copiado' : 'Copiar enlace'}
      </button>
    </div>
  )
}
