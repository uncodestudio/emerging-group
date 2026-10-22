// Apparition : fond en fondu, carte qui monte en grossissant légèrement, lignes de classement en cascade.
// Disparition : la carte redescend et s'efface, puis le fond. GSAP est chargé par Webflow ;
// sans GSAP ou en mouvement réduit, la modale s'affiche et se masque directement.
const OPEN_DURATION = 0.45
const CLOSE_DURATION = 0.25

const canAnimate = () => typeof gsap !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches

// Une timeline par modale : une ouverture pendant la fermeture (ou l'inverse) arrête la précédente,
// sans que son onComplete ne masque la modale.
const timelines = new WeakMap()

function newTimeline(modal, vars) {
  timelines.get(modal)?.kill()
  const tl = gsap.timeline(vars)
  timelines.set(modal, tl)
  return tl
}

function getParts(modal) {
  const card = modal.querySelector('.ranking-modal_component')
  const rows = [...modal.querySelectorAll('.ranking-modal_list-item')]
  return { card, rows, all: [modal, card, ...rows].filter(Boolean) }
}

function openModal(modal) {
  modal.style.display = 'flex'
  if (!canAnimate()) return

  const { card, rows } = getParts(modal)
  const tl = newTimeline(modal)
  tl.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
  if (card) {
    tl.fromTo(card, { opacity: 0, y: 32, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: OPEN_DURATION, ease: 'power3.out' }, 0.05)
  }
  if (rows.length) {
    tl.fromTo(rows, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 }, 0.2)
  }
}

function closeModal(modal) {
  if (!canAnimate()) {
    modal.style.display = 'none'
    return
  }

  const { card, all } = getParts(modal)
  const tl = newTimeline(modal, {
    onComplete: () => {
      modal.style.display = 'none'
      gsap.set(all, { clearProps: 'opacity,transform' })
    },
  })
  if (card) tl.to(card, { opacity: 0, y: 16, scale: 0.97, duration: CLOSE_DURATION, ease: 'power2.in' })
  tl.to(modal, { opacity: 0, duration: CLOSE_DURATION, ease: 'power2.in' }, 0.05)
}

export function init() {
  const isTouch = window.matchMedia('(hover: none)').matches

  // cursor: pointer via style injection pour fix iOS Safari (tous les items, y compris chargés par Finsweet)
  const style = document.createElement('style')
  style.textContent = '.ranking-list_item, .ranking-modal_close { cursor: pointer; }'
  if (isTouch) style.textContent += ' .ranking-modal_info-wrapper { cursor: pointer; }'
  document.head.appendChild(style)

  // Ouvrir la modale
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-ignore]')) return
    const item = e.target.closest('.ranking-list_item')
    if (!item) return
    const wrapper = item.closest('.ranking-list_item-wrapper')
    const modal = wrapper?.querySelector('.ranking-modal_wrapper')
    if (modal) openModal(modal)
  })

  // Fermer via bouton close
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.ranking-modal_close')
    if (!closeBtn) return
    const modal = closeBtn.closest('.ranking-modal_wrapper')
    if (modal) closeModal(modal)
  })

  // Fermer en cliquant sur le backdrop
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('ranking-modal_wrapper')) {
      closeModal(e.target)
    }
  })

  // Afficher/cacher ranking-modal_more-infos (enfant de ranking-modal_info-wrapper)
  if (isTouch) {
    document.addEventListener('click', (e) => {
      const infoWrapper = e.target.closest('.ranking-modal_info-wrapper')
      if (!infoWrapper) return
      const moreInfos = infoWrapper.querySelector('.ranking-modal_more-infos')
      if (!moreInfos) return
      moreInfos.style.display = moreInfos.style.display === 'flex' ? 'none' : 'flex'
    })
  } else {
    document.addEventListener('mouseover', (e) => {
      const infoWrapper = e.target.closest('.ranking-modal_info-wrapper')
      if (!infoWrapper || infoWrapper.contains(e.relatedTarget)) return
      const moreInfos = infoWrapper.querySelector('.ranking-modal_more-infos')
      if (moreInfos) moreInfos.style.display = 'flex'
    })
    document.addEventListener('mouseout', (e) => {
      const infoWrapper = e.target.closest('.ranking-modal_info-wrapper')
      if (!infoWrapper || infoWrapper.contains(e.relatedTarget)) return
      const moreInfos = infoWrapper.querySelector('.ranking-modal_more-infos')
      if (moreInfos) moreInfos.style.display = 'none'
    })
  }
}
