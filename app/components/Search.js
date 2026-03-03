export function createSearch({store, card_display}) {
  const container = document.querySelector('#toolbar-center')
  if (!container) return

  container.innerHTML = `
    <div class="search-container">
      <span class="search-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>
      <input type="text" class="search-input" placeholder="Search people... (Ctrl+F)" autocomplete="off">
      <div class="search-results"></div>
    </div>
  `

  const input = container.querySelector('.search-input')
  const results = container.querySelector('.search-results')
  let selectedIndex = -1

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase()
    if (query.length < 1) {
      results.classList.remove('visible')
      return
    }

    const data = store.getData().filter(d => !d.to_add)
    const matches = data.filter(d => {
      const values = Object.values(d.data || {}).map(v => String(v).toLowerCase())
      return values.some(v => v.includes(query))
    }).slice(0, 8)

    if (matches.length === 0) {
      results.classList.remove('visible')
      return
    }

    selectedIndex = -1
    results.innerHTML = matches.map((d, i) => `
      <div class="search-result-item" data-id="${d.id}" data-index="${i}">
        <div class="result-name">${card_display[0](d)}</div>
        <div class="result-detail">${card_display[1](d)}</div>
      </div>
    `).join('')
    results.classList.add('visible')

    results.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        navigateTo(el.dataset.id)
      })
    })
  })

  input.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('.search-result-item')
    if (!items.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1)
      updateSelection(items)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, 0)
      updateSelection(items)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      navigateTo(items[selectedIndex].dataset.id)
    } else if (e.key === 'Escape') {
      results.classList.remove('visible')
      input.blur()
    }
  })

  function updateSelection(items) {
    items.forEach((el, i) => {
      el.style.background = i === selectedIndex ? 'rgba(255,255,255,0.08)' : ''
    })
  }

  function navigateTo(id) {
    store.update.mainId(id)
    store.update.tree({tree_position: 'main_to_middle'})
    results.classList.remove('visible')
    input.value = ''
    input.blur()
  }

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      results.classList.remove('visible')
    }
  })

  // Expose focus method for keyboard shortcut
  window._fcSearchFocus = () => input.focus()
}
