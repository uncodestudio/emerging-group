// Apparition : fond en fondu, carte qui monte en grossissant légèrement, lignes de classement en cascade.
// Disparition : la carte redescend et s'efface, puis le fond. GSAP est chargé par Webflow ;
// sans GSAP ou en mouvement réduit, la modale s'affiche et se masque directement.
// Accessibilité : le bouton « More details » de chaque ligne (la ligne elle-même s'il n'y en a pas) ouvre la modale
// au clavier (Entrée, Espace). La modale est un dialog : le focus y entre, y reste (Tab), Échap la ferme et le focus
// revient sur le bouton qui l'a ouverte. Les attributs sont posés ici, y compris sur les lignes chargées par Finsweet.
const OPEN_DURATION = 0.45
const CLOSE_DURATION = 0.25
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

const canAnimate = () => typeof gsap !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches

// Une timeline par modale : une ouverture pendant la fermeture (ou l'inverse) arrête la précédente,
// sans que son onComplete ne masque la modale.
const timelines = new WeakMap()

// Lignes déjà préparées (un clone Finsweet d'une ligne préparée n'y est pas et reçoit ses propres ids).
const ready = new WeakSet()
let uid = 0

// Modale ouverte et bouton qui l'a ouverte, pour rendre le focus à la fermeture.
let openedModal = null
let lastTrigger = null

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

function setupItem(wrapper) {
  if (ready.has(wrapper)) return
  const item = wrapper.querySelector('.ranking-list_item')
  const modal = wrapper.querySelector('.ranking-modal_wrapper')
  if (!item || !modal) return
  ready.add(wrapper)
  const id = ++uid
  const title = modal.querySelector('h1, h2, h3, h4')
  const name = item.querySelector('[fs-list-field="Name"]')?.textContent.trim() || title?.textContent.trim() || ''

  // La ligne reste cliquable à la souris. Son aria-label « open-modal » masquait le nom de l'école : retiré.
  item.removeAttribute('aria-label')
  const link = item.querySelector('a[href="#"]:not([data-modal-ignore])')
  const trigger = link || item
  if (link) {
    item.removeAttribute('role')
    if (name) link.setAttribute('aria-label', `${link.textContent.trim()}: ${name}`)
  } else {
    item.setAttribute('tabindex', '0')
  }
  trigger.setAttribute('role', 'button')
  trigger.setAttribute('aria-haspopup', 'dialog')
  trigger.setAttribute('data-ranking-trigger', '')

  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.setAttribute('tabindex', '-1')
  if (title) {
    title.id = `ranking-modal-title-${id}`
    modal.setAttribute('aria-labelledby', title.id)
  }

  const close = modal.querySelector('.ranking-modal_close')
  if (close) {
    close.setAttribute('role', 'button')
    close.setAttribute('tabindex', '0')
    close.setAttribute('aria-label', 'Close')
  }

  // Icône « i » : atteignable au clavier, son texte est lu comme description et s'affiche au focus.
  modal.querySelectorAll('.ranking-modal_info-wrapper').forEach((info, i) => {
    const more = info.querySelector('.ranking-modal_more-infos')
    if (!more) return
    more.id = `ranking-modal-info-${id}-${i + 1}`
    info.setAttribute('role', 'button')
    info.setAttribute('tabindex', '0')
    info.setAttribute('aria-label', 'More information')
    info.setAttribute('aria-describedby', more.id)
    info.setAttribute('aria-expanded', 'false')
  })
}

function setupAll() {
  document.querySelectorAll('.ranking-list_item-wrapper').forEach(setupItem)
}

function setInfo(info, open) {
  const more = info.querySelector('.ranking-modal_more-infos')
  if (!more) return
  more.style.display = open ? 'flex' : 'none'
  info.setAttribute('aria-expanded', String(open))
}

function openModal(modal, trigger) {
  openedModal = modal
  lastTrigger = trigger || null
  modal.style.display = 'flex'
  ;(modal.querySelector('.ranking-modal_close') || modal).focus({ preventScroll: true })
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
  const trigger = lastTrigger
  openedModal = null
  lastTrigger = null
  const hide = () => {
    modal.style.display = 'none'
    trigger?.focus({ preventScroll: true })
  }
  if (!canAnimate()) {
    hide()
    return
  }

  const { card, all } = getParts(modal)
  const tl = newTimeline(modal, {
    onComplete: () => {
      hide()
      gsap.set(all, { clearProps: 'opacity,transform' })
    },
  })
  if (card) tl.to(card, { opacity: 0, y: 16, scale: 0.97, duration: CLOSE_DURATION, ease: 'power2.in' })
  tl.to(modal, { opacity: 0, duration: CLOSE_DURATION, ease: 'power2.in' }, 0.05)
}

// Tab et Maj+Tab tournent entre les éléments focusables visibles de la modale.
function trapFocus(e, modal) {
  const items = [...modal.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length)
  if (!items.length) {
    e.preventDefault()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (!modal.contains(active) || (e.shiftKey && active === first) || (!e.shiftKey && active === last)) {
    e.preventDefault()
    ;(e.shiftKey ? last : first).focus()
  }
}

export function init() {
  const isTouch = window.matchMedia('(hover: none)').matches

  // cursor: pointer via style injection pour fix iOS Safari (tous les items, y compris chargés par Finsweet)
  const style = document.createElement('style')
  style.textContent = '.ranking-list_item, .ranking-modal_close { cursor: pointer; }'
  if (isTouch) style.textContent += ' .ranking-modal_info-wrapper { cursor: pointer; }'
  document.head.appendChild(style)

  // Préparer les lignes présentes, puis celles que la pagination Finsweet insère.
  setupAll()
  const lists = new Set([...document.querySelectorAll('.ranking-list_item-wrapper')].map((w) => w.closest('.w-dyn-items') || w.parentElement))
  const observer = new MutationObserver(setupAll)
  lists.forEach((list) => observer.observe(list, { childList: true, subtree: true }))

  // Ouvrir la modale (le lien « More details » en href="#" ne doit pas faire remonter la page)
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-ignore]')) return
    const item = e.target.closest('.ranking-list_item')
    if (!item) return
    if (e.target.closest('a[href="#"]')) e.preventDefault()
    const wrapper = item.closest('.ranking-list_item-wrapper')
    const modal = wrapper?.querySelector('.ranking-modal_wrapper')
    if (modal) openModal(modal, item.querySelector('[data-ranking-trigger]') || item)
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

  // Clavier : Échap et Tab dans la modale ouverte ; Entrée et Espace sur les boutons
  document.addEventListener('keydown', (e) => {
    if (openedModal) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeModal(openedModal)
        return
      }
      if (e.key === 'Tab') {
        trapFocus(e, openedModal)
        return
      }
    }
    if (e.key !== 'Enter' && e.key !== ' ') return

    const trigger = e.target.closest('[data-ranking-trigger]')
    if (trigger) {
      e.preventDefault()
      const modal = trigger.closest('.ranking-list_item-wrapper')?.querySelector('.ranking-modal_wrapper')
      if (modal) openModal(modal, trigger)
      return
    }
    const closeBtn = e.target.closest('.ranking-modal_close')
    if (closeBtn) {
      e.preventDefault()
      closeModal(closeBtn.closest('.ranking-modal_wrapper'))
      return
    }
    const info = e.target.closest('.ranking-modal_info-wrapper')
    if (info) {
      e.preventDefault()
      setInfo(info, info.getAttribute('aria-expanded') !== 'true')
    }
  })

  // Infos complémentaires au focus clavier
  document.addEventListener('focusin', (e) => {
    const info = e.target.closest?.('.ranking-modal_info-wrapper')
    if (info) setInfo(info, true)
  })
  document.addEventListener('focusout', (e) => {
    const info = e.target.closest?.('.ranking-modal_info-wrapper')
    if (info && !info.contains(e.relatedTarget)) setInfo(info, false)
  })

  // Afficher/cacher ranking-modal_more-infos (enfant de ranking-modal_info-wrapper)
  if (isTouch) {
    document.addEventListener('click', (e) => {
      const infoWrapper = e.target.closest('.ranking-modal_info-wrapper')
      if (!infoWrapper) return
      const moreInfos = infoWrapper.querySelector('.ranking-modal_more-infos')
      if (!moreInfos) return
      setInfo(infoWrapper, moreInfos.style.display !== 'flex')
    })
  } else {
    document.addEventListener('mouseover', (e) => {
      const infoWrapper = e.target.closest('.ranking-modal_info-wrapper')
      if (!infoWrapper || infoWrapper.contains(e.relatedTarget)) return
      setInfo(infoWrapper, true)
    })
    document.addEventListener('mouseout', (e) => {
      const infoWrapper = e.target.closest('.ranking-modal_info-wrapper')
      if (!infoWrapper || infoWrapper.contains(e.relatedTarget)) return
      setInfo(infoWrapper, false)
    })
  }
}
