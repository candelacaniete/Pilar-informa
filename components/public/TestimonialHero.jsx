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

const INTERVAL_MS = 7000

const POSITION_CLASS = {
  'top-left': 'float-card--pos-tl',
  'top-right': 'float-card--pos-tr',
  'bottom-left': 'float-card--pos-bl',
  'bottom-right': 'float-card--pos-br',
}

function CartBadge() {
  return (
    <span className="float-card__badge float-card__badge--cart" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    </span>
  )
}

function FloatCard({ card, variant }) {
  const posClass = POSITION_CLASS[card.position] || ''
  const slotClass = `float-card float-card--${card.slot} ${posClass}`.trim()
  const floatAttr = variant === 'desktop' ? { 'data-float': card.float } : {}

  if (card.type === 'product') {
    return (
      <div className={slotClass} {...floatAttr}>
        <div className="float-card__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image} alt={card.imageAlt || ''} loading="eager" decoding="async" />
          {card.cart ? <CartBadge /> : null}
        </div>
        {card.label ? <p className="float-card__label">{card.label}</p> : null}
        {card.meta?.map((line) => (
          <p key={line} className="float-card__meta">
            {line}
          </p>
        ))}
      </div>
    )
  }

  if (card.type === 'google') {
    return (
      <div className={slotClass} {...floatAttr}>
        <div className="float-card__header">
          <span className="float-card__google" aria-hidden="true">
            G
          </span>
          <span className="float-card__stars">
            ★★★★★ <strong>{card.stars}</strong>
          </span>
        </div>
        <p className="float-card__label">{card.label}</p>
        {card.meta?.map((line) => (
          <p key={line} className="float-card__meta">
            {line}
          </p>
        ))}
      </div>
    )
  }

  if (card.type === 'info') {
    return (
      <div className={`${slotClass} float-card--info`} {...floatAttr}>
        <p className="float-card__label">{card.label}</p>
        {card.meta?.map((line) => (
          <p key={line} className="float-card__meta">
            {line}
          </p>
        ))}
        {card.chip ? <span className="float-card__chip">{card.chip}</span> : null}
      </div>
    )
  }

  if (card.type === 'map') {
    return (
      <div className={`${slotClass} float-card--map`} {...floatAttr}>
        <div className="float-card__map" aria-hidden="true">
          <span className="float-card__map-pin" />
        </div>
        <p className="float-card__label">{card.label}</p>
      </div>
    )
  }

  if (card.type === 'social') {
    return (
      <div className={`${slotClass} float-card--social`} {...floatAttr}>
        <div className="float-card__social-head">
          <span className="float-card__insta" aria-hidden="true" />
          <span className="float-card__meta">Instagram</span>
        </div>
        <div className="float-card__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image} alt={card.imageAlt || ''} loading="eager" decoding="async" />
        </div>
      </div>
    )
  }

  if (card.type === 'cta') {
    return (
      <div className={`${slotClass} float-card--cta`} {...floatAttr}>
        <button type="button" className="float-card__btn">
          {card.ctaIcon ? <span aria-hidden="true">{card.ctaIcon}</span> : null}
          {card.cta}
        </button>
      </div>
    )
  }

  if (card.type === 'gallery') {
    return (
      <div className={`${slotClass} float-card--gallery`} {...floatAttr}>
        <div className="float-card__gallery">
          {card.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.src} src={img.src} alt={img.alt} loading="eager" decoding="async" />
          ))}
        </div>
        {card.meta?.map((line) => (
          <p key={line} className="float-card__meta">
            {line}
          </p>
        ))}
      </div>
    )
  }

  if (card.type === 'contact') {
    return (
      <div className={`${slotClass} float-card--contact`} {...floatAttr}>
        <p className="float-card__label">{card.label}</p>
        {card.meta?.map((line) => (
          <p key={line} className="float-card__meta">
            {line}
          </p>
        ))}
        {card.cta ? (
          <button
            type="button"
            className={`float-card__btn${card.ctaLarge ? ' float-card__btn--large' : ''}`}
          >
            {card.cta}
          </button>
        ) : null}
      </div>
    )
  }

  return null
}

function SlideStage({ slide }) {
  return (
    <div className="testimonial-stage" style={{ '--slide-bg': slide.bg }}>
      <div className="testimonial-orbit" aria-hidden="true">
        <div className="testimonial-cards testimonial-cards--desktop">
          {slide.cards.map((card) => (
            <FloatCard key={`d-${card.slot}`} card={card} variant="desktop" />
          ))}
        </div>
      </div>

      <div className="testimonial-core">
        <p className="testimonial-core__name">
          {slide.titleLeft} {slide.titleRight}
        </p>
        <div className="testimonial-portrait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="testimonial-portrait__img"
            src={slide.portrait}
            alt={`${slide.name}, comerciante de Pilar`}
            width={280}
            height={280}
            loading="eager"
            decoding="async"
          />
        </div>
        <p className="testimonial-core__phrase">{slide.impact}</p>
      </div>

      <div className="testimonial-cards testimonial-cards--mobile">
        {slide.cards.map((card) => (
          <FloatCard key={`m-${card.slot}`} card={card} variant="mobile" />
        ))}
      </div>
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
      aria-label="Historias de comercios en Guía Pilar"
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
            aria-label={slide.name}
            aria-selected={i === index}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>
    </section>
  )
}
