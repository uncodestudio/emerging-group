export function init() {
  const article = document.querySelector('[data-toc="article"]')
  const tocList = document.querySelector('.article_toc-list')
  const template = tocList?.querySelector('.article_toc-item')
  if (!article || !tocList || !template) return

  const headings = article.querySelectorAll('h2')

  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = `toc-heading-${index + 1}`

    const item = template.cloneNode(true)
    const number = item.querySelector('.toc_number')
    const title = item.querySelector('.toc_title')
    if (number) number.textContent = `${index + 1}.`
    if (title) title.textContent = heading.textContent

    item.addEventListener('click', () => {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    tocList.appendChild(item)
  })

  template.remove()
}
