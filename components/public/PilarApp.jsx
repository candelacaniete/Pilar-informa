'use client'

import { useEffect, useState } from 'react'
import PilarConversation from './PilarConversation'

const SPLASH_MS = 2200
const SPLASH_KEY = 'pilar_splash_seen'

export default function PilarApp() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SPLASH_KEY) === '1') {
        setShowSplash(false)
        return
      }
    } catch {
      // sessionStorage puede fallar en privado
    }

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SPLASH_KEY, '1')
      } catch {
        // ignore
      }
      setShowSplash(false)
    }, SPLASH_MS)

    return () => clearTimeout(timer)
  }, [])

  const skip = () => {
    try {
      sessionStorage.setItem(SPLASH_KEY, '1')
    } catch {
      // ignore
    }
    setShowSplash(false)
  }

  if (showSplash) {
    return (
      <div className="pilar-splash flex min-h-dvh flex-col items-center justify-center bg-teal px-6 text-center text-white">
        <div className="pilar-splash-mark flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-white font-display text-5xl font-semibold text-teal shadow-lift">
          P
        </div>
        <p className="pilar-splash-copy mt-7 font-display text-4xl font-semibold tracking-tight">Pilar</p>
        <p className="pilar-splash-copy mt-2 text-sm text-white/80" style={{ animationDelay: '180ms' }}>
          Tu guía de Pilar Informa
        </p>
        <button
          type="button"
          onClick={skip}
          className="pilar-splash-copy mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-white/70"
          style={{ animationDelay: '400ms' }}
        >
          Saltar
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="flex items-center gap-3 border-b border-line/80 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal font-display text-lg font-semibold text-white">
          P
        </span>
        <div>
          <p className="font-bold text-ink">Pilar</p>
          <p className="text-xs text-muted">Preguntame lo que necesités en Pilar</p>
        </div>
      </header>
      <PilarConversation />
    </div>
  )
}
