import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { LegalList, LegalSection, LegalShell } from '@/components/public/LegalShell'

export const metadata = buildPageMetadata({
  title: 'Política de Privacidad',
  description:
    'Cómo Guía Pilar trata los datos personales de negocios, visitantes y usuarios del asistente Pilar.',
  path: '/privacidad',
})

export default function PrivacidadPage() {
  return (
    <LegalShell current="/privacidad" eyebrow="Guía Pilar" title="Política de Privacidad">
      <LegalSection title="Responsable del tratamiento de datos">
        <p>
          Guía Pilar es un proyecto operado por Katem, con domicilio en Buenos Aires, Argentina. Ante
          cualquier consulta sobre esta política, podés escribirnos a{' '}
          <a href="mailto:hola@guiapilar.ar" className="font-medium text-teal hover:underline">
            hola@guiapilar.ar
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Qué información recolectamos">
        <p>
          <strong className="font-semibold text-ink">De los negocios que se suman a la guía:</strong>{' '}
          nombre del negocio, categoría, dirección, teléfono/WhatsApp, horarios, descripción, fotos y
          datos de contacto que el propio negocio nos proporciona al darse de alta.
        </p>
        <p>
          <strong className="font-semibold text-ink">De quienes visitan el sitio:</strong> no
          requerimos registro para navegar la guía, buscar negocios o consultar noticias y eventos.
          El uso de cookies técnicas está detallado en nuestra{' '}
          <Link href="/cookies" className="font-medium text-teal hover:underline">
            Política de Cookies
          </Link>
          , que incluye el detalle de qué cookies usamos y para qué.
        </p>
        <p>
          <strong className="font-semibold text-ink">Del asistente Pilar (bot):</strong> las
          conversaciones con el asistente no se almacenan de forma identificable a una persona. Se
          guarda únicamente un contador anónimo de consultas mensuales por navegador, según se
          explica en la Política de Cookies.
        </p>
        <p>
          <strong className="font-semibold text-ink">De quienes dejan una reseña:</strong> el sistema
          de reseñas funciona con el código único que cada negocio entrega a sus propios clientes. No
          pedimos datos personales (nombre, email, teléfono) para dejar una reseña.
        </p>
      </LegalSection>

      <LegalSection title="Para qué usamos esta información">
        <LegalList
          items={[
            'Mostrar la ficha del negocio en la guía pública.',
            'Permitir el contacto directo entre usuarios y negocios vía WhatsApp.',
            'Enviar comunicaciones administrativas a los negocios sobre su plan (vencimientos, pagos).',
            'Mejorar el funcionamiento del sitio y del asistente Pilar.',
          ]}
        />
        <p>
          No vendemos ni cedemos datos personales a terceros con fines comerciales o publicitarios.
        </p>
      </LegalSection>

      <LegalSection title="Dónde se almacenan los datos">
        <p>
          Los datos se almacenan en Supabase, nuestro proveedor de base de datos, que actúa como
          encargado del tratamiento bajo nuestras instrucciones.
        </p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>
          De acuerdo a la Ley 25.326 de Protección de Datos Personales, tenés derecho a acceder,
          rectificar, actualizar o solicitar la eliminación de tus datos personales. Para ejercer
          estos derechos, escribinos a{' '}
          <a href="mailto:hola@pilarinforma.ar" className="font-medium text-teal hover:underline">
            hola@pilarinforma.ar
          </a>
          . La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la
          Ley 25.326, tiene la atribución de atender denuncias y reclamos que interpongan quienes
          resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de
          protección de datos personales.
        </p>
      </LegalSection>

      <LegalSection title="Menores de edad">
        <p>
          Guía Pilar no está dirigida a menores de 18 años. No recolectamos intencionalmente datos
          de menores.
        </p>
      </LegalSection>

      <LegalSection title="Cambios a esta política">
        <p>
          Podemos actualizar esta política ocasionalmente. Los cambios importantes se van a reflejar
          con una nueva fecha de actualización al pie de esta página.
        </p>
      </LegalSection>
    </LegalShell>
  )
}
