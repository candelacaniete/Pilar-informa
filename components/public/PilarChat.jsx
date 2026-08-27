'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import PilarConversation from './PilarConversation'

export default function PilarChat() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-teal px-4 py-3.5 text-sm font-semibold text-white shadow-lift transition hover:bg-teal-dark md:bottom-8 md:right-8"
        aria-label="Abrir chat con Pilar"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 font-display text-lg">
          P
        </span>
        <span className="pr-1">Preguntale a Pilar</span>
        <MessageCircle className="h-4 w-4 opacity-80" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-end sm:justify-end sm:p-6 md:p-8">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 sm:bg-ink/25"
            aria-label="Cerrar chat"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-[min(92dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-line bg-paper shadow-lift sm:rounded-3xl">
            <header className="flex items-center justify-between border-b border-line/80 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal font-display text-lg font-semibold text-white">
                  P
                </span>
                <div>
                  <p className="font-bold text-ink">Pilar</p>
                  <p className="text-xs text-muted">Tu guía local de Pilar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <PilarConversation compact />
          </div>
        </div>
      ) : null}
    </>
  )
}
