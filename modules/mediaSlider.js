// Slider « They talk about us » (home) : collection list montée en Splide.
// Splide 4 est importé à la main dans le code de la page qui en a besoin (R-45), pas ici.
// Structure Webflow : .home-media_component.splide > .home-media_track.splide__track
//   > .home-media_list.splide__list > .home-media_item.splide__slide
// Flèches : [data-carousel="prev"] et [data-carousel="next"] dans .home-media_component.

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

  document.querySelectorAll('.home-media_component.splide').forEach((component) => {
    const prev = component.querySelector('[data-carousel="prev"]')
    const next = component.querySelector('[data-carousel="next"]')

    const splide = new window.Splide(component, {
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
        767: { perPage: 1, padding: { right: '15%' } },
      },
    })

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
