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
    // Ctrl+Shift+Z or Ctrl+Y = Redo
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
  })
}
