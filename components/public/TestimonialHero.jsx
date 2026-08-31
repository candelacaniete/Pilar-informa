'use client'

import { useCallback, useEffect, useState } from 'react'
import { Poppins } from 'next/font/google'
import { TESTIMONIAL_SLIDES } from '@/lib/testimonialHero/slides'
import './testimonial-hero.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const INTERVAL_MS = 3500

function SlideStage({ slide }) {
  return (
    <div className="testimonial-stage" style={{ '--slide-bg': slide.bg }}>
      <blockquote className="testimonial-quote">
        <p className="testimonial-quote__lead">{slide.lead}</p>
        <p className="testimonial-quote__payoff">{slide.payoff}</p>
      </blockquote>

      <div className="testimonial-portrait">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="testimonial-portrait__img"
          src={slide.portrait}
          alt=""
          width={300}
          height={300}
          loading="eager"
          decoding="async"
        />
      </div>

      <p className="testimonial-byline">
        <span className="testimonial-byline__name">{slide.name}</span>
        <span className="testimonial-byline__sep" aria-hidden="true">
          ·
        </span>
        <span className="testimonial-byline__trade">{slide.trade}</span>
      </p>
    </div>
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
      className={`testimonial-hero ${poppins.className}`}
      aria-label="Historias de comerciantes en Pilar"
      aria-roledescription="carousel"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="testimonial-hero__viewport">
        {TESTIMONIAL_SLIDES.map((slide, i) => (
          <article
            key={slide.id}
            className={`testimonial-slide${i === index ? ' is-active' : ''}`}
            aria-hidden={i !== index}
          >
            <SlideStage slide={slide} />
          </article>
        ))}
      </div>

      <div className="testimonial-hero__dots" role="tablist" aria-label="Historias">
        {TESTIMONIAL_SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className={`testimonial-hero__dot${i === index ? ' is-active' : ''}`}
            aria-label={`${slide.name}, ${slide.trade}`}
            aria-selected={i === index}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>
    </section>
  )
}
