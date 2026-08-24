const BREAKPOINT = 767
const PIXELS_PER_SECOND = 40

export function init() {
  const wrappers = document.querySelectorAll('.header-small-number_wrapper')
  if (!wrappers.length) return

  injectStyles()

  const mq = window.matchMedia(`(max-width: ${BREAKPOINT}px)`)
  wrappers.forEach((wrapper) => setupMarquee(wrapper, mq))
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

function injectStyles() {
  const style = document.createElement('style')
  style.textContent = `
    .header-small-number_wrapper.is-marquee {
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
