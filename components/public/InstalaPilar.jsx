'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Share, Smartphone } from 'lucide-react'

export default function InstalaPilar() {
  const [installEvent, setInstallEvent] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (standalone) setInstalled(true)

    const onPrompt = (event) => {
      event.preventDefault()
      setInstallEvent(event)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const installAndroid = async () => {
    if (!installEvent) return
    installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  return (
    <section id="instalar-pilar" className="overflow-hidden rounded-[1.75rem] border border-teal/20 bg-white">
      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="px-6 py-8 md:px-9 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">App Pilar</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink md:text-4xl">
            Instalá a Pilar en el celular
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted md:text-base">
            Es una app aparte: solo la asistente. Sin noticias ni menú. Le preguntás en lenguaje
            natural por farmacias de turno, promos, eventos y locales.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {installEvent && !installed ? (
              <button
                type="button"
                onClick={installAndroid}
                className="inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
              >
                <Smartphone className="h-4 w-4" />
                Instalar Pilar
              </button>
            ) : (
              <Link
                href="/pilar"
                className="inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
              >
                Abrir Pilar
              </Link>
            )}
            {installed ? (
              <p className="self-center text-sm font-medium text-teal">Ya la tenés instalada.</p>
            ) : null}
          </div>
        </div>

        <div className="border-t border-line/70 bg-paper-deep/50 px-6 py-8 md:border-l md:border-t-0 md:px-8 md:py-10">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-ink">
            <Share className="h-4 w-4 text-teal" />
            En iPhone (Safari)
          </p>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
            <li>
              <span className="font-semibold text-ink">1.</span> Tocá{' '}
              <Link href="/pilar" className="font-semibold text-teal underline-offset-2 hover:underline">
                Abrir Pilar
              </Link>{' '}
              para entrar a la asistente.
            </li>
            <li>
              <span className="font-semibold text-ink">2.</span> Abajo, tocá el botón Compartir
              (el cuadrado con la flecha hacia arriba).
            </li>
            <li>
              <span className="font-semibold text-ink">3.</span> Elegí{' '}
              <strong>Agregar a pantalla de inicio</strong> y confirmá. El ícono va a decir Pilar.
            </li>
          </ol>
          <p className="mt-4 text-xs text-muted">
            En Android, si no aparece el botón Instalar: menú de Chrome (⋮) → Instalar app.
          </p>
        </div>
      </div>
    </section>
  )
}
