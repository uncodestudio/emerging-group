const BREAKPOINT = 767
const PIXELS_PER_SECOND = 40

// Chiffres clés de l'en-tête Digital Leaders : les éléments sont enfants directs de la carte,
// le défilement les regroupe dans une ligne dupliquée.
const RANKING_SELECTOR = '.ranking-header_numbers-wrapper'

export const SELECTOR = `.header-small-number_wrapper, ${RANKING_SELECTOR}`

export function init() {
  const wrappers = document.querySelectorAll(SELECTOR)
  if (!wrappers.length) return

  injectStyles()

  const mq = window.matchMedia(`(max-width: ${BREAKPOINT}px)`)
  wrappers.forEach((wrapper) =>
    wrapper.matches(RANKING_SELECTOR) ? setupRankingMarquee(wrapper, mq) : setupMarquee(wrapper, mq)
  )
}

function setupMarquee(wrapper, mq) {
  const track = wrapper.querySelector('.header-small_number')
  if (!track) return

  let trackWrapper = null

  const enable = () => {
    if (trackWrapper) return

    trackWrapper = document.createElement('div')
    trackWrapper.className = 'header-small-number_marquee-track'

    wrapper.insertBefore(trackWrapper, track)
    trackWrapper.appendChild(track)

    const dot = track.querySelector('.header_dot')
    if (dot) trackWrapper.appendChild(dot.cloneNode(true))

    const clone = track.cloneNode(true)
    clone.setAttribute('aria-hidden', 'true')
    trackWrapper.appendChild(clone)

    wrapper.classList.add('is-marquee')

    const singleWidth = track.getBoundingClientRect().width
    const duration = singleWidth / PIXELS_PER_SECOND
    trackWrapper.style.animationDuration = `${duration}s`
  }

  const disable = () => {
    if (!trackWrapper) return

    wrapper.insertBefore(track, trackWrapper)
    trackWrapper.remove()
    trackWrapper = null

    wrapper.classList.remove('is-marquee')
  }

  mq.addEventListener('change', (e) => (e.matches ? enable() : disable()))
  if (mq.matches) enable()
}

// Les chiffres et séparateurs sont regroupés dans une série, suivie d'un séparateur pour la jonction,
// puis dupliquée : la piste défile de la largeur d'une série (translateX -50 %).
function setupRankingMarquee(wrapper, mq) {
  let items = null
  let trackWrapper = null

  const enable = () => {
    if (trackWrapper) return

    items = [...wrapper.children]
    const set = document.createElement('div')
    set.className = 'ranking-header_marquee-set'
    items.forEach((item) => set.appendChild(item))

    const divider = document.createElement('div')
    divider.className = 'ranking-header_divider'
    set.appendChild(divider)

    const clone = set.cloneNode(true)
    clone.setAttribute('aria-hidden', 'true')

    trackWrapper = document.createElement('div')
    trackWrapper.className = 'header-small-number_marquee-track'
    trackWrapper.append(set, clone)
    wrapper.appendChild(trackWrapper)
    wrapper.classList.add('is-marquee')

    const duration = set.getBoundingClientRect().width / PIXELS_PER_SECOND
    trackWrapper.style.animationDuration = `${duration}s`
  }

  const disable = () => {
    if (!trackWrapper) return

    items.forEach((item) => wrapper.insertBefore(item, trackWrapper))
    trackWrapper.remove()
    trackWrapper = null
    items = null

    wrapper.classList.remove('is-marquee')
  }

  mq.addEventListener('change', (e) => (e.matches ? enable() : disable()))
  if (mq.matches) enable()
}

function injectStyles() {
  const style = document.createElement('style')
  style.textContent = `
    .header-small-number_wrapper.is-marquee,
    ${RANKING_SELECTOR}.is-marquee {
      overflow: hidden;
    }
    .header-small-number_marquee-track {
      display: flex;
      align-items: center;
      width: max-content;
      animation-name: header-small-number-marquee;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    ${RANKING_SELECTOR} .header-small-number_marquee-track,
    .ranking-header_marquee-set {
      display: flex;
      align-items: stretch;
    }
    @keyframes header-small-number-marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .header-small-number_marquee-track {
        animation: none;
      }
    }
  `
  document.head.appendChild(style)
}
