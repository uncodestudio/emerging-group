// Rich text des articles (.article_article-rich-text) : retire les paragraphes vides que le contenu
// utilise comme espaces avant les titres. Les écarts viennent des marges des titres (CSS de la page modèle).
export const SELECTOR = '.article_article-rich-text'

// Espaces, espaces insécables et caractères invisibles (zero-width) que Webflow laisse dans un paragraphe vide.
const BLANK = /[\s​-‍]/g

function isEmpty(paragraph) {
  if (paragraph.querySelector('img, iframe, video, svg')) return false
  return paragraph.textContent.replace(BLANK, '') === ''
}

export function init() {
  document.querySelectorAll(SELECTOR).forEach((richText) => {
    richText.querySelectorAll(':scope > p').forEach((paragraph) => {
      if (isEmpty(paragraph)) paragraph.remove()
    })
  })
}
