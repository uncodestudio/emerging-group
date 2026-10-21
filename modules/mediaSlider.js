// Slider « They talk about us » (home) : collection list montée en Splide.
// Splide n'est chargé par jsDelivr que sur les pages où la section existe (R-45).
// Structure Webflow : .home-media_component > .home-media_track (wrapper) > .home-media_list > .home-media_item
// Flèches : [data-carousel="prev"] et [data-carousel="next"] dans .home-media_component.

const SPLIDE = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist'

const loaded = new Map()
function load(tag, url) {
  if (!loaded.has(url)) {
    loaded.set(
      url,
      new Promise((resolve, reject) => {
        const el = document.createElement(tag)
        if (tag === 'link') {
          el.rel = 'stylesheet'
          el.href = url
        } else {
          el.src = url
        }
        el.onload = resolve
        el.onerror = reject
        document.head.appendChild(el)
      })
    )
  }
  return loaded.get(url)
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

// init reste synchrone pour main.js ; une erreur de chargement est journalisée ici.
export function init() {
  mount().catch((error) => console.error('[mediaSlider]', error))
}

async function mount() {
  const components = document.querySelectorAll('.home-media_component')
  if (!components.length) return

  await Promise.all([
    load('link', `${SPLIDE}/css/splide-core.min.css`),
    load('script', `${SPLIDE}/js/splide.min.js`),
  ])

  components.forEach((component) => {
    const track = component.querySelector('.home-media_track')
    const list = component.querySelector('.home-media_list')
    const items = component.querySelectorAll('.home-media_item')
    if (!track || !list || !items.length) return

    component.classList.add('splide')
    track.classList.add('splide__track')
    list.classList.add('splide__list')
    items.forEach((item) => item.classList.add('splide__slide'))

    const prev = component.querySelector('[data-carousel="prev"]')
    const next = component.querySelector('[data-carousel="next"]')

    const splide = new window.Splide(component, {
      type: 'slide',
      perPage: 4,
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

    splide.on('mounted moved updated resized', update)
    splide.mount()
    bindArrow(prev, splide, '<')
    bindArrow(next, splide, '>')
  })
}
