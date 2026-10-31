const buttons = document.querySelectorAll('[data-layout]')

function selectLayout(layout) {
  const selected = layout === 'b' ? 'b' : 'a'
  document.body.dataset.layout = selected
  const page = document.querySelector('.page')
  page.prepend(page.querySelector(selected === 'b' ? '.discovery' : '.hero'))
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.layout === selected)))
  const url = new URL(window.location.href)
  url.searchParams.set('forslag', selected)
  history.replaceState(null, '', url)
}

buttons.forEach((button) => button.addEventListener('click', () => selectLayout(button.dataset.layout)))
selectLayout(new URL(window.location.href).searchParams.get('forslag'))
