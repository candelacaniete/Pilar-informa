'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'

const SUGGESTIONS = [
  'Farmacia de turno en Zelaya',
  '¿Qué promociones hay?',
  'Eventos esta semana',
  'Restaurantes en Del Viso',
]

export default function PilarChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const [messages, setMessages] = useState([
    {
      role: 'pilar',
      text: 'Hola, soy Pilar. Preguntame por farmacias de turno, promos, eventos o locales de la guía. Respondo solo con lo que está cargado en Pilar Informa.',
    },
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    fetch('/api/pilar')
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining))
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async (text) => {
    const message = (text || input).trim()
    if (!message || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: message }])
    setLoading(true)

    try {
      const res = await fetch('/api/pilar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (typeof data.remaining === 'number') setRemaining(data.remaining)

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'pilar', text: data.error || 'No pude responder ahora. Probá de nuevo.' },
        ])
        return
      }

      setMessages((prev) => [...prev, { role: 'pilar', text: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'pilar', text: 'Hubo un problema de conexión. Intentá otra vez.' },
      ])
    } finally {
      setLoading(false)
    }
  }

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
                  <p className="text-xs text-muted">Tu guía de Pilar Informa</p>
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

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-auto bg-teal text-white'
                      : 'bg-white text-ink shadow-soft'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading ? (
                <p className="text-xs font-medium text-muted">Pilar está buscando…</p>
              ) : null}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-line/80 bg-white px-3 py-3">
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="shrink-0 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-teal hover:text-teal"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Preguntale a Pilar…"
                  maxLength={400}
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal text-white disabled:opacity-50"
                  aria-label="Enviar"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              {remaining !== null ? (
                <p className="mt-2 text-center text-[11px] text-muted">
                  Te quedan {remaining} consultas hoy
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
