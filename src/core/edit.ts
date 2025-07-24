import * as d3 from "d3"
import { createForm } from "./form"
import { createHistory, createHistoryControls, HistoryWithControls } from "../features/history"
import { formInfoSetupExisting, formInfoSetupNew } from "../renderers/form"
import addRelative from "./add-relative"
import { deletePerson, cleanupDataJson } from "../store/edit"
import { handleLinkRel } from "../store/add-existing-rel"
import removeRelative, { RemoveRelative } from "./remove-relative"
import modal, { Modal } from "../features/modal"
import { kinshipInfo } from "../features/kinships/kinship-info"

import { Store } from "../types/store"
import { Data, Datum } from "../types/data"
import { TreeDatum } from "../types/treeData"
import { AddRelative } from "./add-relative"
import { FormCreator } from "./form"
import { CardHtml } from "./cards/card-html"
import { CardSvg } from "./cards/card-svg"

type Card = CardHtml | CardSvg


export default (cont: HTMLElement, store: Store) => new EditTree(cont, store)

export class EditTree {
  cont: HTMLElement
  store: Store
  fields: {type: string, label: string, id: string}[]
  form_cont: HTMLElement
  is_fixed: boolean
  no_edit: boolean
  onChange: (() => void) | null
  editFirst: boolean
  postSubmit: ((datum: Datum, data: Data) => void) | null
  link_existing_rel_config: any
  onFormCreation: null | ((props: {cont: HTMLElement, form_creator: FormCreator}) => void)
  kinship_info_config: any

  addRelativeInstance: AddRelative
  removeRelativeInstance: RemoveRelative
  history: HistoryWithControls
  modal: Modal

  
  constructor(cont: HTMLElement, store: Store) {
    this.cont = cont
    this.store = store
  
    this.fields = [
      {type: 'text', label: 'first name', id: 'first name'},
      {type: 'text', label: 'last name', id: 'last name'},
      {type: 'text', label: 'birthday', id: 'birthday'},
      {type: 'text', label: 'avatar', id: 'avatar'}
    ]
  
    this.is_fixed = true
  
    this.no_edit = false
  
    this.onChange = null
  
    this.editFirst = false
  
    this.postSubmit = null
  
    this.link_existing_rel_config = null
  
    this.onFormCreation = null
  
    this.kinship_info_config = null
  
    this.form_cont = d3.select(this.cont).append('div').classed('f3-form-cont', true).node()!
    this.modal = this.setupModal()
    this.addRelativeInstance = this.setupAddRelative()
    this.removeRelativeInstance = this.setupRemoveRelative()
    this.history = this.createHistory()
  
    return this 
  }

  open(datum: Datum) {
    if (this.addRelativeInstance.is_active) handleAddRelative(this)
    else if (this.removeRelativeInstance.is_active) handleRemoveRelative(this, this.store.getTreeDatum(datum.id))
    else {
      this.cardEditForm(datum)
    }
  
    function handleAddRelative(self: EditTree) {
      if (datum._new_rel_data) {
        self.cardEditForm(datum)
      } else {
        self.addRelativeInstance.onCancel!()
        self.cardEditForm(datum)
        self.store.updateMainId(datum.id)
        self.store.updateTree({})
      }
    }
  
    function handleRemoveRelative(self: EditTree, tree_datum: TreeDatum | undefined) {
      if (!tree_datum) throw new Error('Tree datum not found')
      if (!self.removeRelativeInstance.datum) throw new Error('Remove relative datum not found')
      if (!self.removeRelativeInstance.onCancel) throw new Error('Remove relative onCancel not found')
      if (!self.removeRelativeInstance.onChange) throw new Error('Remove relative onChange not found')

      if (datum.id === self.removeRelativeInstance.datum.id) {
        self.removeRelativeInstance.onCancel()
        self.cardEditForm(datum)
      } else {
        self.removeRelativeInstance.onChange(tree_datum, onAccept.bind(self))
  
        function onAccept() {
          self.removeRelativeInstance.onCancel!()
          self.updateHistory()
          self.store.updateTree({})
        }
      }
    }
  }

  private setupAddRelative() {
    return addRelative(this.store, () => onActivate(this), (datum: Datum) => cancelCallback(this, datum))
  
    function onActivate(self: EditTree) {
      if (self.removeRelativeInstance.is_active) self.removeRelativeInstance.onCancel!()
    }
  
    function cancelCallback(self: EditTree, datum: Datum) {
      self.store.updateMainId(datum.id)
      self.store.updateTree({})
      self.openFormWithId(datum.id)
    }
  }
  
  private setupRemoveRelative() {
    return removeRelative(this.store, onActivate.bind(this), cancelCallback.bind(this), this.modal)
  
    function onActivate(this: EditTree) {
      if (this.addRelativeInstance.is_active) this.addRelativeInstance.onCancel!()
      setClass(this.cont, true)
    }
  
    function cancelCallback(this: EditTree, datum: Datum) {
      setClass(this.cont, false)
      this.store.updateMainId(datum.id)
      this.store.updateTree({})
      this.openFormWithId(datum.id)
    }
  
    function setClass(cont: HTMLElement, add: boolean) {
      d3.select(cont).select('#f3Canvas').classed('f3-remove-relative-active', add)
    }
  }

  private createHistory() {
    const history = createHistory(this.store, this.getStoreDataCopy.bind(this), historyUpdateTree.bind(this))

    const nav_cont = this.cont.querySelector('.f3-nav-cont') as HTMLElement
    if (!nav_cont) throw new Error("Nav cont not found")
    const controls = createHistoryControls(nav_cont, history)

    history.changed()
    controls.updateButtons()
  
    return {...history, controls}
  
    function historyUpdateTree(this: EditTree) {
      console.log('historyUpdateTree')
      if (this.addRelativeInstance.is_active) this.addRelativeInstance.onCancel!()
      if (this.removeRelativeInstance.is_active) this.removeRelativeInstance.onCancel!()
      this.store.updateTree({initial: false})
      this.history.controls.updateButtons()
      this.openFormWithId(this.store.getMainDatum()?.id)
      if (this.onChange) this.onChange()
    }
  }

  openWithoutRelCancel(datum: Datum) {
    this.cardEditForm(datum)
  }
  
  cardEditForm(datum: Datum) {
    const props: {
      onCancel?: () => void,
      addRelative?: AddRelative,
      removeRelative?: any,  // todo: RemoveRelative
      deletePerson?: () => void,
    } = {}
    const is_new_rel = datum?._new_rel_data
    if (is_new_rel) {
      props.onCancel = () => this.addRelativeInstance.onCancel!()
    } else {
      props.addRelative = this.addRelativeInstance
      props.removeRelative = this.removeRelativeInstance
      props.deletePerson = () => {
        deletePerson(datum, this.store.getData())
        this.openFormWithId(this.store.getLastAvailableMainDatum().id)
  
        this.store.updateTree({})
      }
    }
  
    const form_creator = createForm({
      store: this.store, 
      datum, 
      postSubmit: (props: any) => postSubmit(this, props),
      fields: this.fields, 
      onCancel: () => {},
      editFirst: this.editFirst,
      no_edit: this.no_edit,
      link_existing_rel_config: this.link_existing_rel_config,
      getKinshipInfo: this.kinship_info_config ? () => kinshipInfo(this.kinship_info_config, datum.id, this.store.getData()) : null,
      onFormCreation: this.onFormCreation,
      ...props
    })
  
    const form_cont = is_new_rel ? formInfoSetupNew(form_creator, this.closeForm.bind(this)) : formInfoSetupExisting(form_creator, this.closeForm.bind(this))
  
    this.form_cont.innerHTML = ''
    this.form_cont.appendChild(form_cont)
  
    this.openForm()
  
    function postSubmit(self: EditTree, props: any) {
      if (self.addRelativeInstance.is_active) {
        self.addRelativeInstance.onChange!(datum, props)
        if (self.postSubmit) self.postSubmit(datum, self.store.getData())
        const active_datum = self.addRelativeInstance.datum
        if (!active_datum) throw new Error('Active datum not found')
        self.store.updateMainId(active_datum.id)
        self.openWithoutRelCancel(active_datum)
      } else if ((datum.to_add || datum.unknown) && props?.link_rel_id) {
        handleLinkRel(datum, props.link_rel_id, self.store.getData())
        self.store.updateMainId(props.link_rel_id)
        self.openFormWithId(props.link_rel_id)
      } else if (!props?.delete) {
        if (self.postSubmit) self.postSubmit(datum, self.store.getData())
        self.openFormWithId(datum.id)
      }
  
      if (!self.is_fixed) self.closeForm()
      
      self.store.updateTree({})
  
      self.updateHistory()
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
  
  setCardClickOpen(card: Card) {
    card.setOnCardClick((e: MouseEvent, d: TreeDatum) => {
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
  
  openFormWithId(d_id: Datum['id']) {
    if (d_id) {
      const d = this.store.getDatum(d_id)
      if (!d) throw new Error('Datum not found')
      this.openWithoutRelCancel(d)
    } else {
      const d = this.store.getMainDatum()!
      if (!d) throw new Error('Main datum not found')
      this.openWithoutRelCancel(d)
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
  
  setFields(fields: any[]) {  // todo: Field[]
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
  
  setOnChange(fn: EditTree['onChange']) {
    this.onChange = fn
  
    return this
  }
  
  addRelative(datum: Datum | undefined) {
    if (!datum) datum = this.store.getMainDatum()!
    this.addRelativeInstance.activate(datum)
  
    return this
  
  }
  
  setupModal() {
    return modal(this.cont)
  }
  
  setEditFirst(editFirst: EditTree['editFirst']) {
    this.editFirst = editFirst
  
    return this
  }
  
  isAddingRelative() {
    return this.addRelativeInstance.is_active
  }
  
  isRemovingRelative() {
    return this.removeRelativeInstance.is_active
  }
  
  setAddRelLabels(add_rel_labels: AddRelative['addRelLabels']) {
    this.addRelativeInstance.setAddRelLabels(add_rel_labels)
    return this
  }
  
  setLinkExistingRelConfig(link_existing_rel_config: EditTree['link_existing_rel_config']) {
    this.link_existing_rel_config = link_existing_rel_config
    return this
  }
  
  setOnFormCreation(onFormCreation: EditTree['onFormCreation']) {
    this.onFormCreation = onFormCreation
  
    return this
  }
  
  setKinshipInfo(kinship_info_config: EditTree['kinship_info_config']) {
    this.kinship_info_config = kinship_info_config
  
    return this
  }
  
  getStoreDataCopy() {  // todo: should make more sense
    let data = JSON.parse(JSON.stringify(this.store.getData()))  // important to make a deep copy of the data
    if (this.addRelativeInstance.is_active) data = this.addRelativeInstance.cleanUp(data)    
    data = cleanupDataJson(data)
    return data
  }
  
  getDataJson() {
    return JSON.stringify(this.getStoreDataCopy(), null, 2)
  }
  
  updateHistory() {
    if (this.history) {
      this.history.changed()
      this.history.controls.updateButtons()
    }
  
    if (this.onChange) this.onChange()
  }
  
  setPostSubmit(postSubmit: EditTree['postSubmit']) {
    this.postSubmit = postSubmit
  
    return this
  }
  
  destroy() {
    this.history.controls.destroy()
    this.history = null as any
    d3.select(this.cont).select('.f3-form-cont').remove()
    if (this.addRelativeInstance.onCancel) this.addRelativeInstance.onCancel()
    this.store.updateTree({})
  
    return this
  }
  
  
}