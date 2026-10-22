// Onglets des pages de catégorie Digital Leaders (.dl-category-tabs) : en mobile la barre défile horizontalement.
// L'onglet de la page affichée (w--current, posé par Webflow sur le lien de la page courante) est centré
// dans la barre au chargement, pour ne pas rester caché à droite (Global ranking, Next 50).
export const SELECTOR = '.dl-category-tabs'

function centerCurrent(tabs) {
  const current = tabs.querySelector('.w--current')
  if (!current || tabs.scrollWidth <= tabs.clientWidth) return

  // La barre est positionnée : elle sert d'offsetParent aux onglets.
  const offset = current.offsetLeft - (tabs.clientWidth - current.offsetWidth) / 2
  tabs.scrollLeft = Math.max(0, offset)
}

export function init() {
  const bars = document.querySelectorAll(SELECTOR)
  const run = () => bars.forEach(centerCurrent)

  run()
  // Les polices chargées après coup changent la largeur des onglets : on recentre une fois la page chargée.
  window.addEventListener('load', run, { once: true })
}
