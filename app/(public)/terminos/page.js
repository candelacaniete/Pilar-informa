import { buildPageMetadata } from '@/lib/seo/metadata'
import { LegalList, LegalSection, LegalShell } from '@/components/public/LegalShell'

export const metadata = buildPageMetadata({
  title: 'Términos y Condiciones',
  description:
    'Términos y condiciones de uso de Guía Pilar: visitantes, negocios, planes, reseñas y asistente Pilar.',
  path: '/terminos',
})

export default function TerminosPage() {
  return (
    <LegalShell current="/terminos" eyebrow="Guía Pilar" title="Términos y Condiciones">
      <LegalSection title="1. Objeto">
        <p>
          Guía Pilar es una guía digital de negocios, servicios, noticias y eventos de la ciudad de
          Pilar, Buenos Aires, operada por Katem. Estos Términos regulan el uso del sitio por parte
          de visitantes y negocios que se suman a la guía.
        </p>
      </LegalSection>

      <LegalSection title="2. Uso del sitio">
        <p>
          El acceso y navegación por Guía Pilar es libre y gratuito para los usuarios. La información
          publicada (horarios, direcciones, promociones, eventos) es proporcionada por los propios
          negocios o recopilada de fuentes públicas, y puede cambiar sin previo aviso. Recomendamos
          confirmar datos importantes (como horarios o disponibilidad) directamente con el negocio
          antes de trasladarte.
        </p>
      </LegalSection>

      <LegalSection title="3. Alta de negocios y planes pagos">
        <LegalList
          items={[
            'Los negocios que quieran aparecer en la guía deben completar el formulario de alta y elegir uno de los planes disponibles (Básico, Destacado o Premium), cuyos precios y beneficios están publicados en el sitio.',
            'El pago se gestiona mediante un plan de suscripción en Mercado Pago, coordinado por WhatsApp.',
            'Ante la falta de pago, el negocio cuenta con una semana de gracia desde el vencimiento. Pasado ese plazo sin regularizar, su ficha se da de baja de la guía pública.',
            'Los precios pueden actualizarse; los cambios no afectan retroactivamente a períodos ya abonados.',
            'Guía Pilar se reserva el derecho de admisión y permanencia de negocios en la guía, pudiendo rechazar o dar de baja fichas que incumplan estos Términos o contengan información falsa.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Categorías de la guía">
        <p>
          Algunas categorías de la guía pueden tener cupo limitado o estar reservadas para negocios
          específicos, según criterio de Guía Pilar. La disponibilidad de cada categoría para nuevas
          altas puede consultarse escribiéndonos directamente.
        </p>
      </LegalSection>

      <LegalSection title="5. Asistente virtual “Pilar”">
        <p>
          El asistente conversacional Pilar responde en base a la información cargada en la guía.
          Puede cometer errores o no tener información actualizada de todos los negocios. Sus
          respuestas tienen carácter informativo y no reemplazan la confirmación directa con el
          negocio consultado.
        </p>
      </LegalSection>

      <LegalSection title="6. Reseñas y contenido generado por usuarios">
        <LegalList
          items={[
            'Cada negocio recibe un código único que puede compartir con sus clientes reales para que dejen una reseña verificada.',
            'Guía Pilar no se hace responsable por el contenido de las opiniones publicadas por terceros, que reflejan la experiencia individual de quien la escribe.',
            'Nos reservamos el derecho de moderar, ocultar o eliminar reseñas que contengan lenguaje difamatorio, discriminatorio, spam, o que a nuestro criterio incumplan un uso de buena fe del sistema.',
          ]}
        />
        <p>
          Si un negocio considera que una reseña es injusta, falsa o de mala fe, puede reportarla
          escribiendo a{' '}
          <a href="mailto:hola@pilarinforma.ar" className="font-medium text-teal hover:underline">
            hola@pilarinforma.ar
          </a>{' '}
          para su revisión.
        </p>
      </LegalSection>

      <LegalSection title="7. Propiedad intelectual">
        <p>
          El nombre “Guía Pilar”, su diseño, logo y contenido propio (no el cargado por negocios
          individuales) son propiedad de Katem. Las fotos, textos y datos que cada negocio carga en
          su ficha son de su propia autoría o titularidad, y el negocio garantiza contar con los
          derechos necesarios para publicarlos.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitación de responsabilidad">
        <p>
          Guía Pilar es un intermediario de información: no participa en las transacciones,
          contrataciones o compras que puedan surgir entre un usuario y un negocio listado. No
          garantizamos la exactitud, calidad o disponibilidad de los productos y servicios ofrecidos
          por los negocios de la guía.
        </p>
      </LegalSection>

      <LegalSection title="9. Modificaciones">
        <p>
          Podemos modificar estos Términos en cualquier momento. Los cambios relevantes se van a
          reflejar con una nueva fecha de actualización al pie de esta página.
        </p>
      </LegalSection>

      <LegalSection title="10. Ley aplicable y jurisdicción">
        <p>
          Estos Términos se rigen por las leyes de la República Argentina. Ante cualquier
          controversia, las partes se someten a los tribunales ordinarios de la jurisdicción
          correspondiente al domicilio de Katem.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <p>
          Ante dudas sobre estos Términos, escribinos a{' '}
          <a href="mailto:hola@guiapilar.ar" className="font-medium text-teal hover:underline">
            hola@guiapilar.ar
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  )
}
