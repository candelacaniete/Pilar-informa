'use client'

import { useCallback, useEffect, useState } from 'react'
import { BRAND_TAGLINE } from '@/lib/seo/site'
import { HERO_SEARCH_HINTS, TESTIMONIAL_SLIDES } from '@/lib/testimonialHero/slides'
import SearchBar from '@/components/public/SearchBar'
import './testimonial-hero.css'

const INTERVAL_MS = 3500
const [TAGLINE_LEAD, TAGLINE_TAIL] = BRAND_TAGLINE.split('. ').map((part, i, arr) =>
  i < arr.length - 1 ? `${part}.` : part,
)

function StoryCard({ slide, active }) {
  return (
    <article
      className={`street-hero__story${active ? ' is-active' : ''}`}
      aria-hidden={!active}
    >
      <div className="street-hero__story-avatar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={slide.image} alt="" width={56} height={56} loading="eager" decoding="async" />
      </div>
      <blockquote className="street-hero__quote">
        <p className="street-hero__quote-lead">{slide.lead}</p>
        <p className="street-hero__quote-payoff">{slide.payoff}</p>
      </blockquote>
      <p className="street-hero__byline">
        <span className="street-hero__byline-name">{slide.name}</span>
        <span aria-hidden="true"> · </span>
        <span className="street-hero__byline-trade">{slide.trade}</span>
      </p>
    </article>
  )
}

export default function TestimonialHero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const setSlide = useCallback((next) => {
    setIndex((next + TESTIMONIAL_SLIDES.length) % TESTIMONIAL_SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return undefined
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIAL_SLIDES.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [paused])

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <section
      id="hero"
      className="street-hero"
      aria-label="Guía Pilar — historias del barrio"
      aria-roledescription="carousel"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="street-hero__media" aria-hidden="true">
        {TESTIMONIAL_SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`street-hero__scene${i === index ? ' is-active' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="street-hero__scene-img"
              src={slide.image}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}
        <div className="street-hero__overlay" />
      </div>

      <div className="street-hero__content">
        <div className="street-hero__main">
          <div className="street-hero__brand">
            <p className="street-hero__eyebrow">Guía Pilar</p>
            <h1 className="street-hero__tagline font-display">
              {TAGLINE_LEAD}
              <span className="street-hero__tagline-accent">{TAGLINE_TAIL}</span>
            </h1>
            <div className="street-hero__search">
              <SearchBar />
              <p className="street-hero__hints">
                {HERO_SEARCH_HINTS.join(' · ')}
              </p>
            </div>
          </div>

          <div className="street-hero__stories" aria-live="polite">
            {TESTIMONIAL_SLIDES.map((slide, i) => (
              <StoryCard key={slide.id} slide={slide} active={i === index} />
            ))}
          </div>
        </div>

        <div className="street-hero__dots" role="tablist" aria-label="Historias del barrio">
          {TESTIMONIAL_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={`street-hero__dot${i === index ? ' is-active' : ''}`}
              aria-label={`${slide.name}, ${slide.trade}`}
              aria-selected={i === index}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
