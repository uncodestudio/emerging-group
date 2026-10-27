// Galerie à défilement horizontal natif (page Label, supports du Label) : flèches et glisser à la souris.
// Structure Webflow : racine [data-scroll-gallery] > piste [data-scroll-track] (overflow-x auto) ; flèches [data-carousel="prev"] et [data-carousel="next"].
// Au doigt et au trackpad, le défilement natif suffit. Les flèches avancent d'une tuile moyenne (320 px + 24 px d'écart, en rem).
export const SELECTOR = '[data-scroll-gallery]'

const STEP_REM = 21.5

export function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  document.querySelectorAll(SELECTOR).forEach((gallery) => {
    const track = gallery.querySelector('[data-scroll-track]')
    if (!track) return
    const prev = gallery.querySelector('[data-carousel="prev"]')
    const next = gallery.querySelector('[data-carousel="next"]')
    const step = () => STEP_REM * parseFloat(getComputedStyle(document.documentElement).fontSize)

    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 1
      ;[
        [prev, track.scrollLeft <= 0],
        [next, track.scrollLeft >= max],
      ].forEach(([button, disabled]) => {
        if (!button) return
        button.style.opacity = disabled ? '0.4' : ''
        button.setAttribute('aria-disabled', String(disabled))
      })
    }

    ;[
      [prev, -1],
      [next, 1],
    ].forEach(([button, direction]) => {
      if (!button) return
      button.addEventListener('click', (event) => {
        event.preventDefault()
        track.scrollBy({ left: direction * step(), behavior: reduceMotion ? 'auto' : 'smooth' })
      })
    })

    // Glisser à la souris : la piste suit le pointeur tant que le bouton est enfoncé
    let drag = null
    track.style.cursor = 'grab'
    track.addEventListener('dragstart', (event) => event.preventDefault())
    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      drag = { x: event.clientX, start: track.scrollLeft }
      track.setPointerCapture(event.pointerId)
      track.style.cursor = 'grabbing'
    })
    track.addEventListener('pointermove', (event) => {
      if (!drag) return
      track.scrollLeft = drag.start - (event.clientX - drag.x)
    })
    const end = () => {
      drag = null
      track.style.cursor = 'grab'
    }
    track.addEventListener('pointerup', end)
    track.addEventListener('pointercancel', end)

    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
  })
}
