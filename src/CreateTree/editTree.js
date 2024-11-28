import d3 from "../d3.js"
import f3 from "../index.js"

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

  this.is_fixed = false

  this.history = null
  this.no_edit = false

  this.init()

  return this
}

EditTree.prototype.init = function() {
  this.form_cont = d3.select(this.cont).append('div').classed('f3-form-cont', true).node()
  this.createHistory()
}

EditTree.prototype.open = function(d) {
  if (!d.data.data) d = {data: d}  // make sure it is tree datum
  f3.handlers.cardEdit(this.store, {d, cardEditForm: this.cardEditForm.bind(this)})
}

EditTree.prototype.cardEditForm = function(props) {
  const postSubmit = props.postSubmit;
  props.postSubmit = postSubmitWrapper.bind(this)
  const form_creator = f3.handlers.createForm({...props, fields: this.fields, card_display: this.card_display})
  form_creator.no_edit = this.no_edit
  const form_cont = f3.handlers.formInfoSetup(form_creator, this.closeForm.bind(this))

  this.form_cont.innerHTML = ''
  this.form_cont.appendChild(form_cont)

  this.openForm()

  function postSubmitWrapper(ps_props) {
    postSubmit(ps_props)
    if (!this.is_fixed) this.closeForm()
    else if (!ps_props?.delete) this.openFormWithId(props.datum.id);
    
    if (this.history) {
      this.history.changed()
      this.history.controls.updateButtons()
    }
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
    this.open(d)
    this.store.updateMainId(d.data.id)
    this.store.updateTree({})
  })

  return this
}

EditTree.prototype.openFormWithId = function(d_id) {
  if (d_id) {
    const d = this.store.getDatum(d_id)
    this.open({data: d})
  } else {
    const d = this.store.getMainDatum()
    this.open({data: d})
  }
}

EditTree.prototype.createHistory = function() {
  this.history = f3.handlers.createHistory(this.store, historyUpdateTree.bind(this))
  this.history.controls = f3.handlers.createHistoryControls(this.cont, this.history)
  this.history.changed()
  this.history.controls.updateButtons()

  return this

  function historyUpdateTree() {
    this.store.updateTree({initial: false})
    this.history.controls.updateButtons()
    this.openFormWithId(this.store.getMainDatum()?.id)
  }
}

EditTree.prototype.destroy = function() {
  this.history.controls.destroy()
  this.history = null
  d3.select(this.cont).select('.f3-form-cont').remove()
  this.store.updateTree({})

  return this
}

EditTree.prototype.setNoEdit = function(no_edit) {
  this.no_edit = no_edit

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