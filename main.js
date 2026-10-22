// Emerging Group — entry point
import { init as initRankingModal } from './modules/rankingModal.js'
import { init as initFixedCta } from './modules/fixedCta.js'
import { init as initArticleToc } from './modules/articleToc.js'
import { init as initHeaderNumberMarquee, SELECTOR as headerNumberMarqueeSelector } from './modules/headerNumberMarquee.js'
import { init as initMediaSlider, SELECTOR as mediaSliderSelector } from './modules/mediaSlider.js'
import { init as initAccordion } from './modules/accordion.js'
import { init as initCategoryTabs, SELECTOR as categoryTabsSelector } from './modules/categoryTabs.js'

const moduleDetectors = {
  rankingModal: { selector: '.ranking-list_item-wrapper', initFn: initRankingModal },
  fixedCta: { selector: '.fixed_cta', initFn: initFixedCta },
  articleToc: { selector: '.article_toc-list', initFn: initArticleToc },
  headerNumberMarquee: { selector: headerNumberMarqueeSelector, initFn: initHeaderNumberMarquee },
  mediaSlider: { selector: mediaSliderSelector, initFn: initMediaSlider },
  accordion: { selector: '[data-accordion]', initFn: initAccordion },
  categoryTabs: { selector: categoryTabsSelector, initFn: initCategoryTabs },
}

Object.entries(moduleDetectors).forEach(([name, { selector, initFn }]) => {
  if (!document.querySelector(selector)) return
  try {
    initFn()
  } catch (e) {
    console.error(`[${name}]`, e)
  }
})
