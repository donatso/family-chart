import * as d3 from 'd3';
import addRelative, { AddRelative } from "./addRelative.ts"
import {cleanupDataJson, createForm, deletePerson} from "./form.js"
import { createHistory, createHistoryControls } from './history.ts';
import { formInfoSetup } from './formInfoSetup.ts';
import type { TreeStore, TreeStoreState } from '../createStore.ts';
import type { FamilyTreeNode, TreePerson } from '../types.ts';


export default function(cont:Element,store: TreeStore) { return new EditTree(cont,store) }

export class EditTree {
  cont: Element
  store: TreeStore
  fields: {type: string, label: string, id: string}[]
  form_cont: HTMLElement | null
  is_fixed: unknown
  history:(ReturnType<typeof createHistory> & {controls?: ReturnType<typeof createHistoryControls>}) | null
  no_edit:unknown
  onChange:(() => void) | null
  editFirst:unknown
  addRelativeInstance: AddRelative | undefined
  card_display:unknown
  constructor(cont: Element, store:TreeStore){
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

  this.init()

  return this
  }
  init() {
    this.form_cont = d3.select(this.cont).append('div').classed('f3-form-cont', true).node()
    this.addRelativeInstance = this.setupAddRelative()
    this.createHistory()
  }
  open(datum: FamilyTreeNode) {
    if (this.addRelativeInstance?.is_active && !datum.data._new_rel_data) {
      this.addRelativeInstance?.onCancel?.()
      const foundDatum = this.store.getDatum(datum.id!)
      if(foundDatum){
        this.cardEditForm(foundDatum)
      }
    }
    else {
      this.cardEditForm(datum.data)
    }
  
   
}
openWithoutRelCancel({data}: {data: TreePerson}) {

  this.cardEditForm(data)
}

cardEditForm(datum: TreePerson) {
  const props: Partial<{onCancel: () => void,addRelative: AddRelative, deletePerson: () => void }> = {}
  const is_new_rel = datum?._new_rel_data
  if (is_new_rel) {
    props.onCancel = () => this.addRelativeInstance?.onCancel?.()
  } else {
    props.addRelative = this.addRelativeInstance
    props.deletePerson = () => {
      const data = this.store.getData()
      deletePerson(datum, data)
      this.store.updateData(data)
      this.openFormWithId(this.store.getLastAvailableMainDatum()?.id)

      this.store.updateTree({})
    }
  }

  const form_creator = createForm({
    store: this.store, 
    datum, 
    postSubmit: postSubmit.bind(this),
    fields: this.fields, 
    addRelative: null,
    onCancel: () => {},
    editFirst: this.editFirst,
    ...props
  })

  form_creator.no_edit = this.no_edit
  const form_cont = formInfoSetup(form_creator, this.closeForm.bind(this))
  if(this.form_cont){
    this.form_cont.innerHTML = ''
    this.form_cont.appendChild(form_cont)
  }
 

  this.openForm()

  function postSubmit(props?: {delete?: boolean}) {
    if (this.addRelativeInstance.is_active) this.addRelativeInstance.onChange(datum)
    else if (!props?.delete) this.openFormWithId(datum.id);

    if (!this.is_fixed) this.closeForm()
    
    this.store.updateTree({})

    this.updateHistory()
  }
}
openForm() {
  d3.select(this.form_cont).classed('opened', true)
}
closeForm() {
  d3.select(this.form_cont).classed('opened', false).html('')
  this.store.updateTree({})
}

fixed() {
  this.is_fixed = true
  d3.select(this.form_cont).style('position', 'relative')

  return this
}

absolute() {
  this.is_fixed = false
  d3.select(this.form_cont).style('position', 'absolute')

  return this
}

setCardClickOpen(card: {setOnCardClick: (arg: (e: Event,d:FamilyTreeNode)=> void)  => void} ) {
  card.setOnCardClick((e: Event,d: FamilyTreeNode) => {
    if (this.addRelativeInstance?.is_active) {
      this.open(d)
      return
    }
    this.open(d)
    this.store.updateMainId(d.data.id)
    this.store.updateTree({})
  })

  return this
}

openFormWithId(d_id:string | undefined) {
  if (d_id) {
    const d = this.store.getDatum(d_id)!
    this.openWithoutRelCancel({data: d})
  } else {
    const d = this.store.getMainDatum()!
    this.openWithoutRelCancel({data: d})
  }
}
createHistory() {
  this.history = createHistory(this.store, this.getStoreData.bind(this), historyUpdateTree.bind(this))
  this.history.controls = createHistoryControls(this.cont, this.history)
  this.history.changed()
  this.history.controls.updateButtons()

  return this

  function historyUpdateTree() {
    if (this.addRelativeInstance.is_active) this.addRelativeInstance.onCancel()
    this.store.updateTree({initial: false})
    this.history.controls.updateButtons()
    this.openFormWithId(this.store.getMainDatum()?.id)
  }
}

setNoEdit() {
  this.no_edit = true

  return this
}
setEdit() {
  this.no_edit = false

  return this
}
setFields(fields: {id: string, type:string,label:string}[]) {
  const new_fields: {type: string, label: string, id: string}[] = []
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
setOnChange(fn: ()=> void) {
  this.onChange = fn

  return this
}
addRelative(datum?: TreePerson) {
  if (!datum) datum = this.store.getMainDatum()
  if(datum){
    this.addRelativeInstance?.activate(datum)
  }
  

  return this


}
setupAddRelative() {
  return addRelative(this.store, cancelCallback.bind(this), onSubmitCallback.bind(this))

  function onSubmitCallback(datum: {id:string}, new_rel_datum?: unknown) {
    this.store.updateMainId(datum.id)
    this.openFormWithId(datum.id)
  }

  function cancelCallback(datum: {id:string}) {
    this.store.updateMainId(datum.id)
    this.store.updateTree({})
    this.openFormWithId(datum.id)
  }
}


setEditFirst(editFirst:unknown) {
  this.editFirst = editFirst

  return this
}

isAddingRelative() {
  return this.addRelativeInstance?.is_active
}

setAddRelLabels(add_rel_labels:Partial<Record<'father' | 'mother' | 'spouse' | 'son' | 'daughter',string>>) {
  this.addRelativeInstance?.setAddRelLabels(add_rel_labels)
  return this
}

getStoreData() {
  if (this.addRelativeInstance?.is_active) return this.addRelativeInstance.getStoreData()!
  else return this.store.state
}

getDataJson(fn: unknown) {
  const data = this.getStoreData()
  return cleanupDataJson(JSON.stringify(data))
}

updateHistory() {
  if (this.history) {
    this.history.changed()
    this.history.controls?.updateButtons()
  }

  if (this.onChange) this.onChange()
}



destroy() {
  this.history?.controls?.destroy()
  this.history = null
  d3.select(this.cont).select('.f3-form-cont').remove()
  if (this.addRelativeInstance?.onCancel) this.addRelativeInstance.onCancel()
  this.store.updateTree({})

  return this
}
}
