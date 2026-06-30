export function init() {
  const cta = document.querySelector('.fixed_cta')
  if (!cta) return

  cta.style.transform = 'translateY(100%)'
  cta.style.transition = 'transform 0.6s ease'

  window.addEventListener('load', () => {
    setTimeout(() => {
      cta.style.transform = 'translateY(0%)'
    }, 4000)
  })
}
