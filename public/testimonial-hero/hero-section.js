/**
 * Testimonial Hero carousel — Guía Pilar
 * Auto-play cada 7s, cross-fade, flechas, dots y Reproducer (play/pause).
 */
;(function initTestimonialHero() {
  const hero = document.getElementById('hero')
  if (!hero) return

  const slides = Array.from(hero.querySelectorAll('.testimonial-slide'))
  const dots = Array.from(hero.querySelectorAll('.testimonial-hero__dot'))
  const prevBtn = hero.querySelector('.testimonial-hero__arrow--prev')
  const nextBtn = hero.querySelector('.testimonial-hero__arrow--next')
  const reproducer = hero.querySelector('.testimonial-hero__reproducer')

  if (!slides.length) return

  const INTERVAL_MS = 7000
  let index = slides.findIndex((s) => s.classList.contains('is-active'))
  if (index < 0) index = 0

  let timer = null
  let playing = true

  function setSlide(nextIndex) {
    index = (nextIndex + slides.length) % slides.length

    slides.forEach((slide, i) => {
      const active = i === index
      slide.classList.toggle('is-active', active)
      slide.setAttribute('aria-hidden', active ? 'false' : 'true')
    })

    dots.forEach((dot, i) => {
      const active = i === index
      dot.classList.toggle('is-active', active)
      dot.setAttribute('aria-selected', active ? 'true' : 'false')
    })
  }

  function next() {
    setSlide(index + 1)
  }

  function prev() {
    setSlide(index - 1)
  }

  function startAutoplay() {
    stopAutoplay()
    if (!playing) return
    timer = window.setInterval(next, INTERVAL_MS)
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer)
      timer = null
    }
  }

  function togglePlay() {
    playing = !playing
    reproducer?.setAttribute('aria-pressed', playing ? 'false' : 'true')
    if (playing) startAutoplay()
    else stopAutoplay()
  }

  nextBtn?.addEventListener('click', () => {
    next()
    startAutoplay()
  })

  prevBtn?.addEventListener('click', () => {
    prev()
    startAutoplay()
  })

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const go = Number(dot.dataset.go)
      if (!Number.isNaN(go)) {
        setSlide(go)
        startAutoplay()
      }
    })
  })

  reproducer?.addEventListener('click', togglePlay)

  hero.addEventListener('mouseenter', stopAutoplay)
  hero.addEventListener('mouseleave', startAutoplay)

  hero.addEventListener('focusin', stopAutoplay)
  hero.addEventListener('focusout', (e) => {
    if (!hero.contains(e.relatedTarget)) startAutoplay()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay()
    else startAutoplay()
  })

  setSlide(index)
  startAutoplay()
})()
