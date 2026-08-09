import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import SectionHeading from '../components/SectionHeading'
import BusinessCard from '../components/BusinessCard'
import BusinessCTA from '../components/BusinessCTA'
import { homeCategories, discoverCards } from '../data/categories'
import { getFeaturedNews, getSecondaryNews } from '../data/news'
import { getFeaturedBusinesses } from '../data/businesses'
import { events } from '../data/events'
import { promotions } from '../data/promotions'

export default function Home() {
  const featured = getFeaturedNews()
  const secondary = getSecondaryNews()
  const featuredBusinesses = getFeaturedBusinesses().slice(0, 3)
  const upcomingEvents = events.slice(0, 3)
  const featuredPromos = promotions.slice(0, 3)

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line/60">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/70 to-paper"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 md:px-6 md:pb-16 md:pt-20">
          <div className="fade-up max-w-3xl">
            <p className="font-extrabold uppercase tracking-[0.22em] text-teal-soft">
              Pilar Informa
            </p>
            <h1 className="mt-4 font-display text-[2.75rem] font-semibold leading-[1.05] text-white md:text-6xl lg:text-[4.25rem]">
              Todo Pilar.
              <br />
              En un solo lugar.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              Noticias, comercios, servicios, eventos y todo lo que pasa cerca tuyo.
            </p>
          </div>

          <div className="fade-up-delay-1 mt-8 max-w-2xl md:mt-10">
            <SearchBar />
            <p className="mt-3 text-sm text-ink-soft/90 md:text-white/65">
              Restaurantes · Peluquerías · Abogados · Gimnasios · Veterinarias
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="fade-up-delay-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            Explorá por categoría
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {homeCategories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.id === 'eventos' ? '/eventos' : `/guia?categoria=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-line/70 bg-white/70 px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-teal/30 hover:bg-white hover:shadow-soft"
              >
                <span className="text-2xl transition group-hover:scale-110" aria-hidden>
                  {cat.emoji}
                </span>
                <span className="text-xs font-semibold text-ink-soft group-hover:text-ink">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-20">
        <SectionHeading
          eyebrow="Medio local"
          title="Lo último de Pilar"
          action={
            <Link
              to="/noticias"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
            >
              Ver todas las noticias
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <Link
            to="/noticias"
            className="group relative overflow-hidden rounded-[1.5rem] bg-ink text-white shadow-soft"
          >
            <img
              src={featured.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
            <div className="relative flex min-h-[340px] flex-col justify-end p-6 md:min-h-[420px] md:p-8">
              <span className="w-fit rounded-md bg-teal px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                {featured.category}
              </span>
              <h3 className="mt-3 max-w-xl font-display text-2xl font-semibold leading-snug md:text-3xl lg:text-[2.1rem]">
                {featured.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
                {featured.excerpt}
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/60">
                <Clock className="h-3.5 w-3.5" />
                {featured.location} · {featured.timeAgo}
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-4">
            {secondary.map((item) => (
              <Link
                key={item.id}
                to="/noticias"
                className="group flex gap-4 rounded-2xl border border-line/70 bg-white p-3 transition hover:border-teal/25 hover:shadow-soft md:p-4"
              >
                <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl md:h-28 md:w-32">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
                    {item.category}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink group-hover:text-teal-dark">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted">
                    {item.location} · {item.timeAgo}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DISCOVER */}
      <section className="border-y border-line/60 bg-white/50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Descubrimiento"
            title="Descubrí lugares cerca tuyo"
            subtitle="Encontrá dónde comer, comprar, resolver trámites o disfrutar tu tiempo libre."
            action={
              <Link
                to="/guia"
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-dark"
              >
                Explorar guía
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {discoverCards.map((card) => (
              <Link
                key={card.id}
                to={`/guia?categoria=${encodeURIComponent(card.title)}`}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={card.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-2xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED BUSINESSES */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Guía local"
          title="Negocios destacados"
          subtitle="Perfiles verificados que la gente de Pilar está mirando."
          action={
            <Link
              to="/guia"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
            >
              Ver la guía
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </section>

      {/* EVENTS */}
      <section className="bg-paper-deep/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Agenda"
            title="Qué hacer en Pilar"
            action={
              <Link
                to="/eventos"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
              >
                Ver agenda
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to="/eventos"
                className="group overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={event.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                    {event.dateLabel} · {event.location}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{event.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMOS */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Beneficios"
          title="Promociones en Pilar"
          action={
            <Link
              to="/promociones"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
            >
              Ver promociones
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featuredPromos.map((promo) => (
            <Link
              key={promo.id}
              to="/promociones"
              className="group relative overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:shadow-lift"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={promo.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <span className="inline-flex rounded-md bg-amber-soft px-2 py-1 text-xs font-bold text-amber">
                  {promo.discount}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink">{promo.title}</h3>
                <p className="mt-2 text-sm text-muted">{promo.description}</p>
                <p className="mt-3 text-xs font-medium text-ink-soft">{promo.expires}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA + MAP TEASER */}
      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-16 md:px-6 md:pb-24">
        <BusinessCTA />

        <Link
          to="/mapa"
          className="group relative flex min-h-[200px] overflow-hidden rounded-[1.75rem] border border-line/70"
        >
          <div className="map-grid absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/85 to-transparent" />
          <div className="relative flex flex-col justify-center p-6 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Mapa</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">
              Explorá Pilar en el mapa
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted md:text-base">
              Encontrá lugares cerca tuyo. Comer, comprar, salud, servicios y eventos.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
              Abrir mapa
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </div>
          <span className="absolute left-[35%] top-[40%] h-3.5 w-3.5 rounded-full bg-teal shadow-[0_0_0_6px_rgba(14,124,117,0.2)]" />
          <span className="absolute left-[55%] top-[55%] h-3 w-3 rounded-full bg-amber shadow-[0_0_0_5px_rgba(201,133,42,0.2)]" />
          <span className="absolute left-[70%] top-[30%] h-3 w-3 rounded-full bg-ink shadow-[0_0_0_5px_rgba(18,24,22,0.12)]" />
        </Link>
      </section>
    </div>
  )
}
