import {manualZoom} from '../src/handlers/general.js'

export function setupShortcuts({store, view, undoRedo}) {
  document.addEventListener('keydown', (e) => {
    // Don't capture when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return
    }

    const ctrl = e.ctrlKey || e.metaKey

    // Ctrl+Z = Undo
    if (ctrl && !e.shiftKey && e.key === 'z') {
      e.preventDefault()
      undoRedo.undo()
    }
    // Ctrl+Shift+Z = Redo
    else if (ctrl && e.shiftKey && e.key === 'z') {
      e.preventDefault()
      undoRedo.redo()
    }
    // Ctrl+Y = Redo
    else if (ctrl && e.key === 'y') {
      e.preventDefault()
      undoRedo.redo()
    }
    // Ctrl+F or / = Search focus
    else if ((ctrl && e.key === 'f') || (!ctrl && e.key === '/')) {
      e.preventDefault()
      if (window._fcSearchFocus) window._fcSearchFocus()
    }
    // + = Zoom in
    else if (e.key === '+' || e.key === '=') {
      manualZoom({amount: 1.3, svg: view.svg, transition_time: 200})
    }
    // - = Zoom out
    else if (e.key === '-') {
      manualZoom({amount: 0.75, svg: view.svg, transition_time: 200})
    }
    // Arrow keys = Navigate tree
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
      navigateTree(e.key, store, view)
    }
    // Enter = Make highlighted node the main node
    else if (e.key === 'Enter' && store.highlighted.id) {
      e.preventDefault()
      store.update.mainId(store.highlighted.id)
      store.update.tree({})
    }
    // Escape = Clear highlight
    else if (e.key === 'Escape' && store.highlighted.id) {
      setHighlight(store, null)
    }
  })
}

function navigateTree(key, store, view) {
  const tree = store.getTree()
  if (!tree || !tree.data || tree.data.length === 0) return

  const currentId = store.highlighted.id || store.state.main_id || tree.data[0].data.id
  const current = tree.data.find(d => d.data.id === currentId)
  if (!current) {
    setHighlight(store, tree.data[0].data.id)
    return
  }

  let target = null

  if (key === 'ArrowUp') {
    // Go to parent (ancestry direction)
    if (current.parents && current.parents.length > 0) {
      target = current.parents[0]
    } else if (current.parent) {
      target = current.parent
    }
  }
  else if (key === 'ArrowDown') {
    // Go to first child
    if (current.children && current.children.length > 0) {
      target = current.children[0]
    }
  }
  else if (key === 'ArrowLeft' || key === 'ArrowRight') {
    // Go to sibling or spouse
    const siblings = getSiblings(current, tree.data)
    if (siblings.length > 0) {
      const idx = siblings.findIndex(d => d.data.id === currentId)
      const dir = key === 'ArrowRight' ? 1 : -1
      const nextIdx = (idx + dir + siblings.length) % siblings.length
      target = siblings[nextIdx]
    }
  }

  if (target) {
    setHighlight(store, target.data.id)
    panToNode(target, view)
  }
}

function getSiblings(node, treeData) {
  // Collect nodes at the same depth/level near this node
  const candidates = []

  // Check for actual siblings (same parent)
  if (node.parent) {
    const parent = node.parent
    const siblings = treeData.filter(d =>
      d.parent === parent && !d.spouse
    )
    if (siblings.length > 1) return siblings.sort((a, b) => a.x - b.x)
  }

  // Check spouses
  if (node.spouses && node.spouses.length > 0) {
    return [node, ...node.spouses].sort((a, b) => a.x - b.x)
  }
  if (node.spouse) {
    const partner = node.spouse
    return [partner, node, ...(partner.spouses || []).filter(s => s !== node)].sort((a, b) => a.x - b.x)
  }

  return candidates
}

function setHighlight(store, id) {
  const prev = store.highlighted.id
  store.highlighted.id = id

  // Remove previous highlight
  if (prev) {
    const prevEl = document.querySelector(`[data-id="${prev}"]`)
    if (prevEl) prevEl.classList.remove('card-highlighted')
  }

  // Add new highlight
  if (id) {
    const el = document.querySelector(`[data-id="${id}"]`)
    if (el) el.classList.add('card-highlighted')
  }
}

function panToNode(node, view) {
  const svg = view.svg
  if (!svg || !svg.__zoomObj) return

  const svgRect = svg.getBoundingClientRect()
  const d3 = window.d3

  const transform = d3.zoomTransform(svg)
  const screenX = node.x * transform.k + transform.x
  const screenY = node.y * transform.k + transform.y

  // Only pan if node is outside visible area
  const margin = 100
  if (screenX < margin || screenX > svgRect.width - margin ||
      screenY < margin || screenY > svgRect.height - margin) {
    const newX = svgRect.width / 2 - node.x * transform.k
    const newY = svgRect.height / 2 - node.y * transform.k
    d3.select(svg).transition().duration(300)
      .call(svg.__zoomObj.transform, d3.zoomIdentity.translate(newX, newY).scale(transform.k))
  }
}
