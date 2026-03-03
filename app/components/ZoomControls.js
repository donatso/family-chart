import {manualZoom} from '../../src/handlers/general.js'
import {treeFit} from '../../src/view/View.handlers.js'

export function createZoomControls(svg) {
  const workspace = document.querySelector('#workspace')
  const controls = document.createElement('div')
  controls.className = 'zoom-controls'
  controls.innerHTML = `
    <button id="zoom-in" title="Zoom in">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
    <button id="zoom-fit" title="Fit to screen">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
    </button>
    <button id="zoom-out" title="Zoom out">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  `
  workspace.appendChild(controls)

  controls.querySelector('#zoom-in').addEventListener('click', () => {
    manualZoom({amount: 1.4, svg, transition_time: 300})
  })
  controls.querySelector('#zoom-out').addEventListener('click', () => {
    manualZoom({amount: 0.7, svg, transition_time: 300})
  })
  controls.querySelector('#zoom-fit').addEventListener('click', () => {
    treeFit({svg, svg_dim: svg.getBoundingClientRect(), tree_dim: svg.__tree_dim, transition_time: 500})
  })

  // Store tree_dim on svg for fit-to-screen
  const origFit = svg.__tree_dim
  Object.defineProperty(svg, '__tree_dim_setter', {
    set(v) { svg.__tree_dim = v }
  })
}
