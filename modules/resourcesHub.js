// Page Resources : filtres pilotés par l'adresse, recherche de l'en-tête, libellé du tri et chiffres calculés.
// Filtres : Finsweet List v2 dans #ressources-filters (fs-list-field / fs-list-value). Onglets de thèmes en radios avec
//   une option « All » (valeur vide) ; menus Product, Format et Year en cases à cocher (aucune cochée = tout).
//   Webflow publie les radios avec des noms différents (l'API ne règle pas ce nom) : chaque radio reçoit ici le nom de
//   son champ, pour former un vrai groupe.
// Adresse : ?theme=…&format=…&product=…&year=…&q=… (format correspond au champ « type » de Finsweet), plusieurs valeurs
//   séparées par des virgules pour les cases à cocher.
//   Lue au chargement et sur les liens de la page vers /resources?… (appliquée sans rechargement), réécrite à chaque filtre.
// Chiffres : [data-resources-count] compte les cards de la bibliothèque, lues avant tout filtrage.
//   Valeur vide = toutes les ressources, "years" = années distinctes, sinon des critères « champ:valeur » séparés par « | »
//   (ex. "product:GEURS|format:Analysis"). [data-resources-template="{n} analysis"] donne le texte (« {n} » par défaut),
//   [data-resources-hide-empty] masque l'élément quand le compte est nul.
// Recherche de l'en-tête : formulaire [data-resources-search] (GET /resources?q=…), traité sur place sur cette page.
// Tri : options [fs-list-element="sort-trigger"] [fs-list-field] ; le libellé [data-resources-sort-label] reprend l'option choisie.
export const SELECTOR = '#ressources-filters'

const FIELDS = { theme: 'theme', format: 'type', product: 'product', year: 'year' }
const LIBRARY_ID = 'resources'
const URL_DELAY = 300

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const norm = (value) => (value || '').trim().toLowerCase()

const scrollToLibrary = () =>
  document.getElementById(LIBRARY_ID)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })

const hasFilterParams = (params) => [...params.keys()].some((key) => key in FIELDS || key === 'q')

// Cards de la bibliothèque : format, produit et année lus dans les champs Finsweet de chaque card
function readItems() {
  const list = document.querySelector('[fs-list-element="list"]')
  if (!list) return []
  const read = (item, field) => item.querySelector(`[fs-list-field="${field}"]`)?.textContent.trim() || ''
  return [...list.children].map((item) => ({ type: read(item, 'type'), product: read(item, 'product'), year: read(item, 'year') }))
}

function count(items, spec) {
  if (spec === 'years') return new Set(items.map((item) => item.year).filter(Boolean)).size
  const criteria = spec
    .split('|')
    .filter(Boolean)
    .map((part) => {
      const [key, ...rest] = part.split(':')
      return [FIELDS[key.trim()] || key.trim(), norm(rest.join(':'))]
    })
  return items.filter((item) => criteria.every(([field, value]) => norm(item[field]) === value)).length
}

function fillCounts(items) {
  document.querySelectorAll('[data-resources-count]').forEach((el) => {
    const n = count(items, el.dataset.resourcesCount)
    el.textContent = (el.dataset.resourcesTemplate || '{n}').replace('{n}', n)
    if (el.hasAttribute('data-resources-hide-empty')) el.style.display = n ? '' : 'none'
  })
}

const notify = (input) => {
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const splitValues = (value) =>
  (value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

// Radios : coche celle qui porte la première valeur, ou l'option « All » si aucune ne correspond.
// Cases à cocher : coche celles qui portent les valeurs demandées, décoche les autres.
function setField(form, field, values, force) {
  const inputs = [...form.querySelectorAll(`input[fs-list-field="${field}"]`)]
  const wanted = values.map(norm)
  const radios = inputs.filter((input) => input.type === 'radio')
  if (radios.length) {
    const target =
      radios.find((radio) => wanted.includes(norm(radio.getAttribute('fs-list-value')))) ||
      radios.find((radio) => radio.getAttribute('fs-list-value') === '')
    if (!target || (target.checked && !force)) return
    target.checked = true
    notify(target)
    return
  }
  inputs.forEach((input) => {
    const checked = wanted.includes(norm(input.getAttribute('fs-list-value')))
    if (input.checked === checked && !force) return
    input.checked = checked
    notify(input)
  })
}

function setSearch(form, query, force) {
  const input = form.querySelector('[fs-list-field="*"]')
  if (!input || (input.value === query && !force)) return
  input.value = query
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function applyParams(form, params, force = false) {
  Object.entries(FIELDS).forEach(([key, field]) => setField(form, field, splitValues(params.get(key)), force))
  setSearch(form, params.get('q') || '', force)
}

function writeUrl(form) {
  const params = new URLSearchParams()
  Object.entries(FIELDS).forEach(([key, field]) => {
    const values = [...form.querySelectorAll(`input[fs-list-field="${field}"]:checked`)]
      .map((input) => input.getAttribute('fs-list-value'))
      .filter(Boolean)
    if (values.length) params.set(key, values.join(','))
  })
  const query = form.querySelector('[fs-list-field="*"]')?.value.trim()
  if (query) params.set('q', query)
  const search = params.toString()
  history.replaceState(null, '', `${location.pathname}${search ? `?${search}` : ''}${location.hash}`)
}

export function init() {
  const form = document.querySelector(SELECTOR)
  if (!form) return

  // Une radio par champ : même nom pour toutes les radios d'un champ
  form.querySelectorAll('input[type="radio"][fs-list-field]').forEach((radio) => {
    radio.name = radio.getAttribute('fs-list-field')
  })

  // Les chiffres d'abord, tant que toutes les cards sont dans la page
  fillCounts(readItems())

  const initial = new URLSearchParams(location.search)
  if (hasFilterParams(initial)) {
    applyParams(form, initial)
    scrollToLibrary()
    // Finsweet chargé après coup : on réapplique une fois la liste prête
    window.FinsweetAttributes = window.FinsweetAttributes || []
    window.FinsweetAttributes.push(['list', () => applyParams(form, initial, true)])
  }

  let urlTimer
  const scheduleUrl = () => {
    clearTimeout(urlTimer)
    urlTimer = setTimeout(() => writeUrl(form), URL_DELAY)
  }
  form.addEventListener('change', scheduleUrl)
  form.addEventListener('input', scheduleUrl)

  // Liens de la page vers la bibliothèque filtrée : appliqués sur place
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]')
    if (!link || link.target === '_blank') return
    const url = new URL(link.getAttribute('href'), location.href)
    if (url.pathname !== location.pathname || !hasFilterParams(url.searchParams)) return
    event.preventDefault()
    applyParams(form, url.searchParams)
    writeUrl(form)
    scrollToLibrary()
  })

  // Recherche de l'en-tête : cherche dans toutes les ressources (les autres filtres repassent sur « All »). Écoute en
  // capture sur le document pour passer avant la gestion des formulaires de Webflow, qui ne reçoit donc pas l'envoi.
  document.addEventListener(
    'submit',
    (event) => {
      const searchForm = event.target.closest('[data-resources-search]')
      if (!searchForm) return
      event.preventDefault()
      event.stopPropagation()
      applyParams(form, new URLSearchParams({ q: searchForm.querySelector('input[name="q"]')?.value.trim() || '' }))
      writeUrl(form)
      scrollToLibrary()
    },
    true
  )

  // Tri : le libellé du menu reprend l'option choisie ; les options ont href="#", on évite le saut en haut de page
  const sortLabel = document.querySelector('[data-resources-sort-label]')
  document.querySelectorAll('[fs-list-element="sort-trigger"] [fs-list-field]').forEach((option) => {
    option.addEventListener('click', (event) => {
      event.preventDefault()
      if (sortLabel) sortLabel.textContent = option.textContent.trim()
    })
  })
}
