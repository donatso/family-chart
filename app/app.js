import f3 from '../src/index.js'
import {createToolbar} from './components/Toolbar.js'
import {createSearch} from './components/Search.js'
import {createZoomControls} from './components/ZoomControls.js'
import {createModal} from './components/Modal.js'
import {createPersistence} from './persistence.js'
import {createUndoRedo} from './undoRedo.js'
import {createOnboarding} from './components/Onboarding.js'
import {setupShortcuts} from './shortcuts.js'
import {Form} from '../src/view/elements/Form.js'

;(async () => {
  const cont = document.querySelector('#FamilyChart'),
    card_dim = {w:220, h:70, text_x:75, text_y:15, img_w:60, img_h:60, img_x:5, img_y:5},
    card_display = cardDisplay(),
    card_edit = cardEditParams(),
    persistence = createPersistence(),
    initialData = persistence.load() || await fetchSampleData(),
    store = f3.createStore({
      data: initialData,
      node_separation: 250,
      level_separation: 150,
      scale_factor: 0.4
    }),
    modal = createModal(),
    undoRedo = createUndoRedo(store),
    view = f3.d3AnimationView({
      store,
      cont
    }),
    Card = f3.elements.Card({
      store,
      svg: view.svg,
      card_dim,
      card_display,
      mini_tree: true,
      link_break: true,
      cardEditForm,
      addRelative: f3.handlers.AddRelative({store, cont, card_dim, cardEditForm, labels: {mother: 'Add mother'}}),
    })

  view.setCard(Card)

  const onUpdate = (props) => {
    view.update(props || {})
    persistence.save(store.getData())
  }

  store.setOnUpdate(onUpdate)

  // Toolbar
  createToolbar({
    store, view, undoRedo, modal,
    onExportJSON: () => exportJSON(store, card_display),
    onImportJSON: () => importJSON(store, persistence),
  })

  // Search
  createSearch({store, card_display})

  // Zoom controls
  createZoomControls(view.svg)

  // Keyboard shortcuts
  setupShortcuts({store, view, undoRedo, modal})

  // Show onboarding if first visit
  if (!persistence.hasData()) {
    createOnboarding()
  }

  // Initial render
  store.update.tree({initial: true})

  // ── Card edit form (modal-based) ──
  function cardEditForm(props) {
    const postSubmit = props.postSubmit
    props.postSubmit = (ps_props) => {
      undoRedo.snapshot()
      postSubmit(ps_props)
    }
    undoRedo.snapshot()
    Form({...props, card_edit, card_display, edit: modal})
  }
})()

async function fetchSampleData() {
  const r = await fetch('./sample-data.json')
  return r.json()
}

function cardEditParams() {
  return [
    {type: 'text', placeholder: 'first name', key: 'first name'},
    {type: 'text', placeholder: 'last name', key: 'last name'},
    {type: 'text', placeholder: 'birthday', key: 'birthday'},
    {type: 'text', placeholder: 'avatar', key: 'avatar'}
  ]
}

function cardDisplay() {
  const d1 = d => `${d.data['first name'] || ''} ${d.data['last name'] || ''}`,
    d2 = d => `${d.data['birthday'] || ''}`
  d1.create_form = '{first name} {last name}'
  d2.create_form = '{birthday}'
  return [d1, d2]
}

function exportJSON(store, card_display) {
  const data = store.getData().filter(d => !d.to_add)
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'family-tree.json'
  a.click()
  URL.revokeObjectURL(url)
  showToast('Tree exported as JSON')
}

function importJSON(store, persistence) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid data')
        if (!data[0].id || !data[0].rels) throw new Error('Invalid schema')
        store.update.data(data)
        store.update.tree({initial: true})
        persistence.save(data)
        showToast('Tree imported successfully')
      } catch (err) {
        showToast('Import failed: invalid JSON file')
      }
    }
    reader.readAsText(file)
  })
  input.click()
}

function showToast(message) {
  let toast = document.querySelector('.fc-toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.className = 'fc-toast'
    document.body.appendChild(toast)
  }
  toast.textContent = message
  toast.classList.add('visible')
  clearTimeout(toast._timeout)
  toast._timeout = setTimeout(() => toast.classList.remove('visible'), 2500)
}

// Make showToast available globally for other modules
window._fcToast = showToast
