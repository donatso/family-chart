import d3 from "../d3.js"
import f3 from "../index.js"
import addRelative from "./addRelative.js"
import {deletePerson} from "./form.js"
import { handleLinkRel } from "./addRelative.linkRel.js"
import removeRelative from "./removeRelative.js"
import modal from "./modal.js"
import { kinshipInfo } from "./kinshipInfo.js"

export default function(...args) { return new EditTree(...args) }

function EditTree(cont, store) {
  this.cont = cont
  this.store = store

  this.fields = [
    {type: 'text', label: 'first name', id: 'first name'},
    {type: 'text', label: 'last name', id: 'last name'},
    {type: 'text', label: 'birthday', id: 'birthday'},
    {type: 'text', label: 'avatar', id: 'avatar'}
  ]

  this.form_cont = null

  this.is_fixed = true

  this.history = null
  this.no_edit = false

  this.onChange = null

  this.editFirst = false

  this.postSubmit = null

  this.link_existing_rel_config = null

  this.onFormCreation = null

  this.kinship_info_config = null

  this.init()

  return this
}

EditTree.prototype.init = function() {
  this.form_cont = d3.select(this.cont).append('div').classed('f3-form-cont', true).node()
  this.modal = this.setupModal()
  this.addRelativeInstance = this.setupAddRelative()
  this.removeRelativeInstance = this.setupRemoveRelative()
  this.createHistory()
}

EditTree.prototype.open = function(datum) {
  if (datum.data.data && typeof datum.data.data === 'object') datum = datum.data
  const tree_datum = this.store.getTreeDatum(datum.id)
  if (this.addRelativeInstance.is_active) handleAddRelative.call(this, datum)
  else if (this.removeRelativeInstance.is_active) handleRemoveRelative.call(this, tree_datum)
  else {
    this.cardEditForm(datum)
  }

  function handleAddRelative() {
    if (datum._new_rel_data) {
      this.cardEditForm(datum)
    } else {
      this.addRelativeInstance.onCancel()
      this.cardEditForm(datum)
      this.store.updateMainId(datum.id)
      this.store.updateTree({})
    }
  }

  function handleRemoveRelative() {
    if (datum.id === this.removeRelativeInstance.datum.id) {
      this.removeRelativeInstance.onCancel()
      this.cardEditForm(datum)
    } else {
      this.removeRelativeInstance.onChange(tree_datum, onAccept.bind(this))

      function onAccept() {
        this.removeRelativeInstance.onCancel()
        this.updateHistory()
        this.store.updateTree({})
      }
    }
  }
}

EditTree.prototype.openWithoutRelCancel = function(datum) {
  this.cardEditForm(datum)
}

EditTree.prototype.cardEditForm = function(datum) {
  const props = {}
  const is_new_rel = datum?._new_rel_data
  if (is_new_rel) {
    props.onCancel = () => this.addRelativeInstance.onCancel()
  } else {
    props.addRelative = this.addRelativeInstance
    props.removeRelative = this.removeRelativeInstance
    props.deletePerson = () => {
      deletePerson(datum, this.store.getData())
      this.openFormWithId(this.store.getLastAvailableMainDatum().id)

      this.store.updateTree({})
    }
  }

  const form_creator = f3.handlers.createForm({
    store: this.store, 
    datum, 
    postSubmit: postSubmit.bind(this),
    fields: this.fields, 
    addRelative: null,
    onCancel: () => {},
    editFirst: this.editFirst,
    link_existing_rel_config: this.link_existing_rel_config,
    getKinshipInfo: this.kinship_info_config ? () => kinshipInfo(this.kinship_info_config, datum.id, this.store.getData()) : null,
    onFormCreation: this.onFormCreation,
    ...props
  })

  form_creator.no_edit = this.no_edit
  if (this.no_edit) form_creator.editable = false
  const form_cont = f3.handlers.formInfoSetup(form_creator, this.closeForm.bind(this))

  this.form_cont.innerHTML = ''
  this.form_cont.appendChild(form_cont)

  this.openForm()

  function postSubmit(props) {
    if (this.addRelativeInstance.is_active) {
      this.addRelativeInstance.onChange(datum, props)
      if (this.postSubmit) this.postSubmit(datum, this.store.getData())
      const active_datum = this.addRelativeInstance.datum
      this.store.updateMainId(active_datum.id)
      this.openWithoutRelCancel(active_datum)
    } else if ((datum.to_add || datum.unknown) && props?.link_rel_id) {
      handleLinkRel(datum, props.link_rel_id, this.store.getData())
      this.store.updateMainId(props.link_rel_id)
      this.openFormWithId(props.link_rel_id)
    } else if (!props?.delete) {
      if (this.postSubmit) this.postSubmit(datum, this.store.getData())
      this.openFormWithId(datum.id)
    }

    if (!this.is_fixed) this.closeForm()
    
    this.store.updateTree({})

    this.updateHistory()
  }
}

EditTree.prototype.openForm = function() {
  d3.select(this.form_cont).classed('opened', true)
}

EditTree.prototype.closeForm = function() {
  d3.select(this.form_cont).classed('opened', false).html('')
  this.store.updateTree({})
}

EditTree.prototype.fixed = function() {
  this.is_fixed = true
  d3.select(this.form_cont).style('position', 'relative')

  return this
}

EditTree.prototype.absolute = function() {
  this.is_fixed = false
  d3.select(this.form_cont).style('position', 'absolute')

  return this
}

EditTree.prototype.setCardClickOpen = function(card) {
  card.setOnCardClick((e, d) => {
    if (this.isAddingRelative()) {
      this.open(d.data)
    } else if (this.isRemovingRelative()) {
      this.open(d.data)
    } else {
      this.open(d.data)
      card.onCardClickDefault(e, d)
    }
  })

  return this
}

EditTree.prototype.openFormWithId = function(d_id) {
  if (d_id) {
    const d = this.store.getDatum(d_id)
    this.openWithoutRelCancel(d)
  } else {
    const d = this.store.getMainDatum()
    this.openWithoutRelCancel(d)
  }
}

EditTree.prototype.createHistory = function() {
  this.history = f3.handlers.createHistory(this.store, this.getStoreDataCopy.bind(this), historyUpdateTree.bind(this))
  this.history.controls = f3.handlers.createHistoryControls(this.cont.querySelector('.f3-nav-cont'), this.history)
  this.history.changed()
  this.history.controls.updateButtons()

  return this

  function historyUpdateTree() {
    if (this.addRelativeInstance.is_active) this.addRelativeInstance.onCancel()
    if (this.removeRelativeInstance.is_active) this.removeRelativeInstance.onCancel()
    this.store.updateTree({initial: false})
    this.history.controls.updateButtons()
    this.openFormWithId(this.store.getMainDatum()?.id)
    if (this.onChange) this.onChange()
  }
}

EditTree.prototype.setNoEdit = function() {
  this.no_edit = true

  return this
}

EditTree.prototype.setEdit = function() {
  this.no_edit = false

  return this
}

EditTree.prototype.setFields = function(fields) {
  const new_fields = []
  if (!Array.isArray(fields)) {
    console.error('fields must be an array')
    return this
  }
  for (const field of fields) {
    if (typeof field === 'string') {
      new_fields.push({type: 'text', label: field, id: field})
    } else if (typeof field === 'object') {
      if (!field.id) {
        console.error('fields must be an array of objects with id property')
      } else {
        new_fields.push(field)
      }
    } else {
      console.error('fields must be an array of strings or objects')
    }
  }
  this.fields = new_fields

  return this
}

EditTree.prototype.setOnChange = function(fn) {
  this.onChange = fn

  return this
}

EditTree.prototype.addRelative = function(datum) {
  if (!datum) datum = this.store.getMainDatum()
  this.addRelativeInstance.activate(datum)

  return this

}

EditTree.prototype.setupAddRelative = function() {
  return addRelative(this.store, onActivate.bind(this), cancelCallback.bind(this))

  function onActivate() {
    if (this.removeRelativeInstance.is_active) this.removeRelativeInstance.onCancel()
  }

  function cancelCallback(datum) {
    this.store.updateMainId(datum.id)
    this.store.updateTree({})
    this.openFormWithId(datum.id)
  }
}

EditTree.prototype.setupRemoveRelative = function() {
  return removeRelative(this.store, onActivate.bind(this), cancelCallback.bind(this), this.modal)

  function onActivate() {
    if (this.addRelativeInstance.is_active) this.addRelativeInstance.onCancel()
    setClass(this.cont, true)
  }

  function cancelCallback(datum) {
    setClass(this.cont, false)
    this.store.updateMainId(datum.id)
    this.store.updateTree({})
    this.openFormWithId(datum.id)
  }

  function setClass(cont, add) {
    d3.select(cont).select('#f3Canvas').classed('f3-remove-relative-active', add)
  }
}

EditTree.prototype.setupModal = function() {
  return modal(this.cont)
}

EditTree.prototype.setEditFirst = function(editFirst) {
  this.editFirst = editFirst

  return this
}

EditTree.prototype.isAddingRelative = function() {
  return this.addRelativeInstance.is_active
}

EditTree.prototype.isRemovingRelative = function() {
  return this.removeRelativeInstance.is_active
}

EditTree.prototype.setAddRelLabels = function(add_rel_labels) {
  this.addRelativeInstance.setAddRelLabels(add_rel_labels)
  return this
}

EditTree.prototype.setLinkExistingRelConfig = function(link_existing_rel_config) {
  this.link_existing_rel_config = link_existing_rel_config
  return this
}

EditTree.prototype.setOnFormCreation = function(onFormCreation) {
  this.onFormCreation = onFormCreation

  return this
}

EditTree.prototype.setKinshipInfo = function(kinship_info_config) {
  this.kinship_info_config = kinship_info_config

  return this
}

EditTree.prototype.getStoreDataCopy = function() {  // todo: should make more sense
  let data = JSON.parse(JSON.stringify(this.store.getData()))  // important to make a deep copy of the data
  if (this.addRelativeInstance.is_active) data = this.addRelativeInstance.cleanUp(data)    
  data = f3.handlers.cleanupDataJson(data)
  return data
}

EditTree.prototype.getDataJson = function() {
  return JSON.stringify(this.getStoreDataCopy(), null, 2)
}

EditTree.prototype.updateHistory = function() {
  if (this.history) {
    this.history.changed()
    this.history.controls.updateButtons()
  }

  if (this.onChange) this.onChange()
}

EditTree.prototype.setPostSubmit = function(postSubmit) {
  this.postSubmit = postSubmit

  return this
}

EditTree.prototype.destroy = function() {
  this.history.controls.destroy()
  this.history = null
  d3.select(this.cont).select('.f3-form-cont').remove()
  if (this.addRelativeInstance.onCancel) this.addRelativeInstance.onCancel()
  this.store.updateTree({})

  return this
}
