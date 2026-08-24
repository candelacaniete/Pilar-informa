import Link from 'next/link'
import { CONTACT_EMAIL } from '@/lib/seo/site'

export const metadata = {
  title: 'Cookies y privacidad',
  description: 'Qué cookies usa Guía Pilar y para qué, en lenguaje simple.',
  robots: { index: true, follow: true },
}

const cookies = [
  {
    name: 'cookie_consent',
    para: 'Recordar si aceptaste o rechazaste el aviso de cookies, para no mostrarlo otra vez.',
  },
  {
    name: 'pilar_uid',
    para: 'Identificar de forma anónima tu navegador para contar las consultas mensuales al asistente Pilar (tope de 35 por mes). No guarda tu nombre ni datos personales.',
  },
  {
    name: 'pilar_q',
    para: 'Respaldo del contador de consultas del mes, por si la base de datos no responde. Solo guarda mes y cantidad.',
  },
  {
    name: 'sb-*-auth-token (Supabase)',
    para: 'Solo si entrás al panel de administración: mantiene tu sesión iniciada. No se usa en la guía pública ni en el chat de Pilar.',
  },
]

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Guía Pilar</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        Cookies y privacidad
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        Usamos pocas cookies, todas técnicas. No vendemos datos ni mostramos publicidad basada en
        cookies de terceros.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Qué cookies usamos</h2>
        <ul className="mt-4 space-y-4">
          {cookies.map((c) => (
            <li key={c.name} className="border-b border-line/80 pb-4">
              <p className="font-mono text-sm font-medium text-teal">{c.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{c.para}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Otras cosas que guardamos en el navegador</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          En la app de Pilar usamos <span className="font-mono text-xs">sessionStorage</span> (
          <span className="font-mono text-xs">pilar_splash_seen</span>) solo para no repetir la
          pantalla de bienvenida en la misma sesión. No es una cookie y se borra al cerrar la
          pestaña.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Asistente Pilar</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          El chat es anónimo: no guardamos el historial de conversación. Contamos hasta 35 mensajes
          por mes calendario (hora de Argentina) por navegador, usando las cookies de arriba. Si
          rechazás las cookies, podés usar el sitio con normalidad, pero el chat no estará
          disponible.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Contacto</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Si tenés dudas sobre privacidad, escribinos a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-teal hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <p className="mt-12">
        <Link href="/" className="text-sm font-medium text-teal hover:underline">
          ← Volver al inicio
        </Link>
      </p>
    </div>
  )
}
