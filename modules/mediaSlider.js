// Sliders Splide « They talk about us » (home, collection list), témoignages (pages solution),
// citation de la page Digital Leaders (une à la fois, avec points) et galerie des supports de la page Label.
// Splide 4 est importé à la main dans le code de la page qui en a besoin (R-45), pas ici.
// Structure Webflow : racine .splide (.home-media_component, .testimonials_component,
//   .ranking-testimonies_component ou .label-supports_component) > piste .splide__track > liste .splide__list > slides .splide__slide
// Flèches : [data-carousel="prev"] et [data-carousel="next"] dans la racine.

const QUOTE_SELECTOR = '.ranking-testimonies_component.splide'
const GALLERY_SELECTOR = '.label-supports_component.splide'

export const SELECTOR = `.home-media_component.splide, .testimonials_component.splide, ${QUOTE_SELECTOR}, ${GALLERY_SELECTOR}`

// Points posés dans le Designer ([data-carousel="dot"], le premier avec .is-active), pas générés par Splide.
const QUOTE_OPTIONS = {
  type: 'slide',
  perPage: 1,
  perMove: 1,
  gap: '1.5rem',
  arrows: false,
  pagination: false,
  speed: 600,
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

// Tuiles de la largeur de leur image, alignées sur le bord du contenu (même calcul que padding-global et container-large)
// et qui débordent jusqu'au bord de l'écran. omitEnd : la flèche suivante s'éteint quand la dernière tuile est arrivée.
const GALLERY_EDGE = 'max(5vw, calc((100vw - 80rem) / 2))'
const GALLERY_OPTIONS = {
  type: 'slide',
  autoWidth: true,
  perMove: 1,
  gap: '1.5rem',
  padding: { left: GALLERY_EDGE, right: GALLERY_EDGE },
  arrows: false,
  pagination: false,
  speed: 600,
  trimSpace: true,
  omitEnd: true,
}

function optionsFor(component) {
  if (component.matches(QUOTE_SELECTOR)) return QUOTE_OPTIONS
  if (component.matches(GALLERY_SELECTOR)) return GALLERY_OPTIONS
  return CARDS_OPTIONS
}

// Les images sont en chargement différé et sans dimensions : la largeur des tuiles n'est connue qu'une fois l'image arrivée.
function refreshOnImageLoad(component, splide) {
  let pending = false
  const refresh = () => {
    if (pending) return
    pending = true
    requestAnimationFrame(() => {
      pending = false
      splide.refresh()
    })
  }
  component.querySelectorAll('.splide__slide img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', refresh, { once: true })
  })
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

    const splide = new window.Splide(component, optionsFor(component))

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

    const dots = bindDots(component, splide)
    const updateDots = () => dots.forEach((dot, i) => dot.classList.toggle('is-active', i === splide.index))

    // « move » part au début du déplacement avec le nouvel index ; « moved » dépend de la fin de transition.
    splide.on('mounted move updated resized', update)
    splide.on('mounted move', updateDots)
    splide.mount()
    if (component.matches(GALLERY_SELECTOR)) refreshOnImageLoad(component, splide)
    bindArrow(prev, splide, '<')
    bindArrow(next, splide, '>')
  })
}

// Un point par slide : le premier point du Designer sert de modèle s'il en manque, les points en trop sont retirés.
function bindDots(component, splide) {
  const dots = [...component.querySelectorAll('[data-carousel="dot"]')]
  if (!dots.length) return []

  const count = component.querySelectorAll('.splide__slide').length
  while (dots.length < count) {
    const clone = dots[0].cloneNode(true)
    clone.classList.remove('is-active')
    dots[dots.length - 1].after(clone)
    dots.push(clone)
  }
  dots.splice(count).forEach((dot) => dot.remove())

  dots.forEach((dot, i) => {
    dot.setAttribute('tabindex', '0')
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`)
    const go = (event) => {
      event.preventDefault()
      splide.go(i)
    }
    dot.addEventListener('click', go)
    dot.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') go(event)
    })
  })
  return dots
}
