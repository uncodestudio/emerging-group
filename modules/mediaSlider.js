// Sliders Splide « They talk about us » (home, collection list), témoignages (pages solution)
// et citation de la page Digital Leaders (une à la fois, avec points).
// Splide 4 est importé à la main dans le code de la page qui en a besoin (R-45), pas ici.
// Structure Webflow : racine .splide (.home-media_component, .testimonials_component
//   ou .ranking-testimonies_component) > piste .splide__track > liste .splide__list > slides .splide__slide
// Flèches : [data-carousel="prev"] et [data-carousel="next"] dans la racine.

const QUOTE_SELECTOR = '.ranking-testimonies_component.splide'

export const SELECTOR = `.home-media_component.splide, .testimonials_component.splide, ${QUOTE_SELECTOR}`

// Points stylés dans Webflow : les classes Splide par défaut sont remplacées par celles du Designer.
const QUOTE_OPTIONS = {
  type: 'slide',
  perPage: 1,
  perMove: 1,
  gap: '1.5rem',
  arrows: false,
  pagination: true,
  speed: 600,
  classes: {
    pagination: 'ranking-testimonies_dots',
    page: 'ranking-testimonies_dot',
  },
}

const CARDS_OPTIONS = {
  type: 'slide',
  perPage: 3,
  perMove: 1,
  gap: '1.5rem',
  arrows: false,
  pagination: false,
  speed: 600,
  trimSpace: true,
  breakpoints: {
    991: { perPage: 2 },
    // 1,5 carte visible : une carte et une marge d'un tiers (un perPage fractionnaire casse la fin de liste).
    767: { perPage: 1, padding: { right: '33%' } },
  },
}

function bindArrow(button, splide, direction) {
  if (!button) return
  button.setAttribute('tabindex', '0')
  const go = (event) => {
    event.preventDefault()
    splide.go(direction)
  }
  button.addEventListener('click', go)
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') go(event)
  })
}

export function init() {
  if (!window.Splide) {
    console.error('[mediaSlider] Splide absent : ajouter le script Splide dans le code de la page.')
    return
  }

  document.querySelectorAll(SELECTOR).forEach((component) => {
    const prev = component.querySelector('[data-carousel="prev"]')
    const next = component.querySelector('[data-carousel="next"]')

    const options = component.matches(QUOTE_SELECTOR) ? QUOTE_OPTIONS : CARDS_OPTIONS
    const splide = new window.Splide(component, options)

    const update = () => {
      const end = splide.Components.Controller.getEnd()
      ;[
        [prev, splide.index <= 0],
        [next, splide.index >= end],
      ].forEach(([button, disabled]) => {
        if (!button) return
        button.style.opacity = disabled ? '0.4' : ''
        button.setAttribute('aria-disabled', String(disabled))
      })
    }

    // « move » part au début du déplacement avec le nouvel index ; « moved » dépend de la fin de transition.
    splide.on('mounted move updated resized', update)
    splide.mount()
    bindArrow(prev, splide, '<')
    bindArrow(next, splide, '>')
  })
}
