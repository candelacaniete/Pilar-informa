import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { CONTACT_EMAIL } from '@/lib/seo/site'
import { LegalSection, LegalShell } from '@/components/public/LegalShell'

export const metadata = buildPageMetadata({
  title: 'Política de Cookies',
  description: 'Qué cookies usa Guía Pilar y para qué, en lenguaje simple.',
  path: '/cookies',
})

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
    <LegalShell current="/cookies" eyebrow="Guía Pilar" title="Política de Cookies">
      <LegalSection title="Resumen">
        <p>
          Usamos pocas cookies, todas técnicas. No vendemos datos ni mostramos publicidad basada en
          cookies de terceros. Esta página complementa nuestra{' '}
          <Link href="/privacidad" className="font-medium text-teal hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Qué cookies usamos">
        <ul className="space-y-4">
          {cookies.map((c) => (
            <li key={c.name} className="border-b border-line/80 pb-4 last:border-0 last:pb-0">
              <p className="font-mono text-sm font-medium text-teal">{c.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed">{c.para}</p>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Otras cosas que guardamos en el navegador">
        <p>
          En la app de Pilar usamos <span className="font-mono text-xs">sessionStorage</span> (
          <span className="font-mono text-xs">pilar_splash_seen</span>) solo para no repetir la
          pantalla de bienvenida en la misma sesión. No es una cookie y se borra al cerrar la
          pestaña.
        </p>
      </LegalSection>

      <LegalSection title="Asistente Pilar">
        <p>
          El chat es anónimo: no guardamos el historial de conversación. Contamos hasta 35 mensajes
          por mes calendario (hora de Argentina) por navegador, usando las cookies de arriba. Si
          rechazás las cookies, podés usar el sitio con normalidad, pero el chat puede no estar
          disponible.
        </p>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          Si tenés dudas sobre cookies o privacidad, escribinos a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-teal hover:underline">
            {CONTACT_EMAIL}
          </a>{' '}
          o a{' '}
          <a href="mailto:hola@guiapilar.ar" className="font-medium text-teal hover:underline">
            hola@guiapilar.ar
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  )
}
