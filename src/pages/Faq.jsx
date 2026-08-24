import Seo from '../components/Seo'
import JsonLd from '../components/JsonLd'
import { faqs } from '../data/faqs'
import { faqPageJsonLd } from '../seo/schema'

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <Seo
        title="Preguntas frecuentes sobre Guía Pilar"
        description="Cómo aparece un negocio, si la guía es gratis y cómo encontrar veterinarias, farmacias y otros servicios en Pilar."
        path="/preguntas-frecuentes"
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Ayuda</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Preguntas frecuentes
      </h1>
      <p className="mt-3 text-base text-muted md:text-lg">
        Respuestas cortas sobre cómo usar Guía Pilar y cómo aparecen los comercios.
      </p>

      <div className="mt-10 space-y-4">
        {faqs.map((faq) => (
          <section
            key={faq.question}
            className="rounded-2xl border border-line/70 bg-white px-5 py-5 md:px-6"
          >
            <h2 className="font-display text-xl font-semibold text-ink">{faq.question}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{faq.answer}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
