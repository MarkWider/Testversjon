const buttons = document.querySelectorAll('[data-layout]')

function selectLayout(layout) {
  const selected = ['b', 'c'].includes(layout) ? layout : 'a'
  document.body.dataset.layout = selected
  const page = document.querySelector('.page')
  page.hidden = selected === 'c'
  document.querySelector('.magazine').hidden = selected !== 'c'
  page.prepend(page.querySelector(selected === 'b' ? '.discovery' : '.hero'))
  document.querySelectorAll('.main-nav a, .header-link, .wordmark, .footer > a:last-child').forEach((link) => {
    const target = link.getAttribute('href').replace(/^#(c-)?/, '')
    link.setAttribute('href', '#' + (selected === 'c' ? 'c-' : '') + target)
  })
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.layout === selected)))
  const url = new URL(window.location.href)
  url.searchParams.set('forslag', selected)
  history.replaceState(null, '', url)
}

buttons.forEach((button) => button.addEventListener('click', () => selectLayout(button.dataset.layout)))
selectLayout(new URL(window.location.href).searchParams.get('forslag'))
