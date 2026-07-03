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
    if (modal) modal.style.display = 'flex'
  })

  // Fermer via bouton close
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.ranking-modal_close')
    if (!closeBtn) return
    const modal = closeBtn.closest('.ranking-modal_wrapper')
    if (modal) modal.style.display = 'none'
  })

  // Fermer en cliquant sur le backdrop
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('ranking-modal_wrapper')) {
      e.target.style.display = 'none'
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
