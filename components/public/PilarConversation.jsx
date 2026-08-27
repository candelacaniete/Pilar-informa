'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'

export const PILAR_SUGGESTIONS = [
  'Farmacia de turno en Zelaya',
  '¿Qué promociones hay?',
  'Eventos esta semana',
  'Restaurantes en Del Viso',
]

const WELCOME = {
  role: 'pilar',
  text: 'Hola, soy Pilar. Preguntame por farmacias de turno, promos, eventos o locales de la guía. Respondo solo con lo que está cargado en Guía Pilar.',
}

function readConsent() {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('cookie_consent='))
  if (!match) return null
  const value = match.split('=').slice(1).join('=')
  if (value === 'accepted' || value === 'rejected') return value
  return null
}

export default function PilarConversation({ compact = false }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const [consent, setConsent] = useState(null)
  const [messages, setMessages] = useState([WELCOME])
  const bottomRef = useRef(null)

  const refreshQuota = useCallback(() => {
    fetch('/api/pilar')
      .then((r) => r.json())
      .then((d) => {
        if (d.needsConsent) {
          setRemaining(null)
          return
        }
        if (typeof d.remaining === 'number') setRemaining(d.remaining)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setConsent(readConsent())
    const onConsent = (e) => {
      const value = e?.detail ?? readConsent()
      setConsent(value)
      if (value === 'accepted') refreshQuota()
      else setRemaining(null)
    }
    window.addEventListener('pilar:cookie-consent', onConsent)
    return () => window.removeEventListener('pilar:cookie-consent', onConsent)
  }, [refreshQuota])

  useEffect(() => {
    if (consent === 'accepted') refreshQuota()
  }, [consent, refreshQuota])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const chatBlocked = consent !== 'accepted'

  const send = async (text) => {
    const message = (text || input).trim()
    if (!message || loading) return

    if (chatBlocked) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'pilar',
          text:
            consent === 'rejected'
              ? 'Para chatear con Pilar hace falta aceptar las cookies técnicas del sitio. Podés cambiarlo borrando la cookie cookie_consent o desde la página de Cookies.'
              : 'Antes de chatear, aceptá las cookies desde el aviso del sitio. Son solo técnicas para el límite de consultas.',
        },
      ])
      return
    }

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
      if (data.needsConsent) setConsent(readConsent())

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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={`flex-1 space-y-3 overflow-y-auto ${compact ? 'px-4 py-4' : 'px-4 py-5 md:px-6'}`}>
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === 'user' ? 'ml-auto bg-teal text-white' : 'bg-white text-ink shadow-soft'
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading ? <p className="text-xs font-medium text-muted">Pilar está buscando…</p> : null}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line/80 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {PILAR_SUGGESTIONS.map((s) => (
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
        {chatBlocked ? (
          <p className="mt-2 text-center text-[11px] text-muted">
            {consent === 'rejected'
              ? 'Chat pausado: rechazaste las cookies técnicas.'
              : 'Aceptá las cookies del aviso para chatear con Pilar.'}
          </p>
        ) : remaining !== null ? (
          <p className="mt-2 text-center text-[11px] text-muted">
            Te quedan {remaining} consultas este mes
          </p>
        ) : null}
      </div>
    </div>
  )
}
