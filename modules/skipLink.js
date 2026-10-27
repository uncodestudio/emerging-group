// Lien d'évitement « Skip to main content » : premier élément focusable de la page, masqué tant qu'il n'a pas le focus.
// Cible : le <main> de la page (pages de la refonte), sinon le bloc qui suit la nav (anciennes pages sans <main>).
// La cible reçoit tabindex="-1" pour que le focus clavier y arrive vraiment. Tailles en px : les anciennes pages
// n'ont pas la même taille de police racine que la refonte.
export const SELECTOR = 'main, .navbar_component'

const TARGET_ID = 'main-content'

export function init() {
  const target = document.querySelector('main') || document.querySelector('.navbar_component')?.nextElementSibling
  if (!target) return
  if (!target.id) target.id = TARGET_ID
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')

  const style = document.createElement('style')
  style.textContent = `
    .skip-link {
      position: fixed;
      top: -200px;
      left: 16px;
      z-index: 10000;
      padding: 12px 20px;
      border-radius: 8px;
      background: #fff;
      color: #201913;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.5;
      white-space: nowrap;
      text-decoration: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .skip-link:focus { top: 16px; }
    #${target.id}:focus { outline: none; }
  `
  document.head.appendChild(style)

  const link = document.createElement('a')
  link.className = 'skip-link'
  link.href = `#${target.id}`
  link.textContent = 'Skip to main content'
  document.body.prepend(link)
}
