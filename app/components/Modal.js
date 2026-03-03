export function createModal() {
  const root = document.querySelector('#fc-modal-root')

  const overlay = document.createElement('div')
  overlay.className = 'fc-modal-overlay'
  overlay.innerHTML = '<div class="fc-modal"></div>'
  root.appendChild(overlay)

  const el = overlay.querySelector('.fc-modal')

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close()
  })

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      close()
    }
  })

  function open() {
    overlay.classList.add('open')
  }

  function close() {
    overlay.classList.remove('open')
  }

  return {el, open, close}
}
