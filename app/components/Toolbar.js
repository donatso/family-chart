import {manualZoom} from '../../src/handlers/general.js'
import {treeFit} from '../../src/view/View.handlers.js'

export function createToolbar({store, view, undoRedo, modal, onExportJSON, onImportJSON, onExportSVG, onExportPNG}) {
  const toolbar = document.querySelector('#toolbar')

  toolbar.innerHTML = `
    <div class="toolbar-left">
      <span class="app-title">Fractal Family Tree</span>
    </div>
    <div class="toolbar-center" id="toolbar-center"></div>
    <div class="toolbar-right">
      <button class="tb-btn" id="tb-undo" title="Undo (Ctrl+Z)" disabled>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
      </button>
      <button class="tb-btn" id="tb-redo" title="Redo (Ctrl+Shift+Z)" disabled>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      </button>
      <div class="tb-separator"></div>
      <button class="tb-btn-label" id="tb-import" title="Open JSON file">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Open
      </button>
      <div class="tb-dropdown-wrap" id="tb-save-wrap">
        <button class="tb-btn-label" id="tb-save-btn" title="Save / Export">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Save
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="tb-dropdown" id="tb-save-dropdown">
          <button class="tb-dropdown-item" id="tb-export-json">Save as JSON</button>
          <button class="tb-dropdown-item" id="tb-export-svg">Export as SVG</button>
          <button class="tb-dropdown-item" id="tb-export-png">Export as PNG</button>
        </div>
      </div>
    </div>
  `

  // Undo/Redo
  const undoBtn = toolbar.querySelector('#tb-undo')
  const redoBtn = toolbar.querySelector('#tb-redo')

  undoBtn.addEventListener('click', () => { undoRedo.undo(); updateUndoRedoState() })
  redoBtn.addEventListener('click', () => { undoRedo.redo(); updateUndoRedoState() })

  function updateUndoRedoState() {
    undoBtn.disabled = !undoRedo.canUndo()
    redoBtn.disabled = !undoRedo.canRedo()
  }

  // Expose for external updates
  store._updateToolbar = updateUndoRedoState

  // Import
  toolbar.querySelector('#tb-import').addEventListener('click', onImportJSON)

  // Save dropdown
  const saveWrap = toolbar.querySelector('#tb-save-wrap')
  const saveBtn = toolbar.querySelector('#tb-save-btn')
  const saveDropdown = toolbar.querySelector('#tb-save-dropdown')

  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    saveDropdown.classList.toggle('visible')
  })

  document.addEventListener('click', () => {
    saveDropdown.classList.remove('visible')
  })

  toolbar.querySelector('#tb-export-json').addEventListener('click', () => {
    saveDropdown.classList.remove('visible')
    onExportJSON()
  })
  toolbar.querySelector('#tb-export-svg').addEventListener('click', () => {
    saveDropdown.classList.remove('visible')
    if (onExportSVG) onExportSVG()
  })
  toolbar.querySelector('#tb-export-png').addEventListener('click', () => {
    saveDropdown.classList.remove('visible')
    if (onExportPNG) onExportPNG()
  })

  return {updateUndoRedoState}
}
