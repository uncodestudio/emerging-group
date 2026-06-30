export function init() {
  const isTouch = window.matchMedia('(hover: none)').matches

  document.querySelectorAll('.ranking-list_item-wrapper').forEach((wrapper) => {
    const item = wrapper.querySelector('.ranking-list_item')
    const modal = wrapper.querySelector('.ranking-modal_wrapper')
    if (!item || !modal) return

    item.style.cursor = 'pointer'
    item.addEventListener('click', () => {
      modal.style.display = 'flex'
    })

    const closeBtn = modal.querySelector('.ranking-modal_close')
    if (closeBtn) closeBtn.style.cursor = 'pointer'
    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none'
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none'
    })

    modal.querySelectorAll('.ranking-modal_info-wrapper').forEach((infoWrapper) => {
      const moreInfos = infoWrapper.querySelector('.ranking-modal_more-infos')
      if (!moreInfos) return

      if (isTouch) {
        infoWrapper.style.cursor = 'pointer'
        infoWrapper.addEventListener('click', () => {
          const isVisible = moreInfos.style.display === 'flex'
          moreInfos.style.display = isVisible ? 'none' : 'flex'
        })
      } else {
        infoWrapper.addEventListener('mouseenter', () => {
          moreInfos.style.display = 'flex'
        })
        infoWrapper.addEventListener('mouseleave', () => {
          moreInfos.style.display = 'none'
        })
      }
    })
  })
}
