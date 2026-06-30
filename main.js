// Emerging Group — entry point
import { init as initRankingModal } from './modules/rankingModal.js'
import { init as initFixedCta } from './modules/fixedCta.js'
import { init as initArticleToc } from './modules/articleToc.js'

const moduleDetectors = {
  rankingModal: { selector: '.ranking-list_item-wrapper', initFn: initRankingModal },
  fixedCta: { selector: '.fixed_cta', initFn: initFixedCta },
  articleToc: { selector: '.article_toc-list', initFn: initArticleToc },
}

Object.entries(moduleDetectors).forEach(([name, { selector, initFn }]) => {
  if (!document.querySelector(selector)) return
  try {
    initFn()
  } catch (e) {
    console.error(`[${name}]`, e)
  }
})
