import { handleLinkRel } from "../store/add-existing-rel"
import { addDatumRelsPlaceholders, cleanUp, updateGendersForNewRelatives } from "../store/add-relative"
import { Data, Datum } from "../types/data"
import { Store } from "../types/store"

export default (store: Store, onActivate: () => void, cancelCallback: (datum: Datum) => void) => { return new AddRelative(store, onActivate, cancelCallback) }

export class AddRelative {
  store: Store
  onActivate: () => void
  cancelCallback: (datum: Datum) => void
  datum: Datum | null
  onChange: ((updated_datum: Datum, props: any) => void) | null
  onCancel: (() => void) | null
  is_active: boolean
  addRelLabels: {
    father: string
    mother: string
    spouse: string
    son: string
    daughter: string
  }
  canAdd?: (datum: Datum) => {parent?: boolean, spouse?: boolean, child?: boolean}
  
  constructor(store: Store, onActivate: () => void, cancelCallback: (datum: Datum) => void) {

    this.store = store
  
    this.onActivate = onActivate
    this.cancelCallback = cancelCallback
  
    this.datum = null
  
    this.onChange = null
    this.onCancel = null
  
    this.is_active = false
  
    this.addRelLabels = this.addRelLabelsDefault()
  
    return this
  }

  activate(datum: Datum) {
    if (this.is_active) this.onCancel!()
    this.onActivate()
    this.is_active = true
    this.store.state.one_level_rels = true
  
    const store = this.store
  
    this.datum = datum
    let gender_stash = this.datum.data.gender
  
    addDatumRelsPlaceholders(datum, this.getStoreData(), this.addRelLabels, this.canAdd)
    store.updateTree({})
  
    this.onChange = onChange
    this.onCancel = () => onCancel(this)
  
    function onChange(updated_datum: Datum, props: any) {
      if (updated_datum?._new_rel_data) {
        if (props?.link_rel_id) handleLinkRel(updated_datum, props.link_rel_id, store.getData())
        else delete updated_datum._new_rel_data
      } else if (updated_datum.id === datum.id) {
        if (updated_datum.data.gender !== gender_stash) {
          gender_stash = updated_datum.data.gender
          updateGendersForNewRelatives(updated_datum, store.getData())
        }
      } else {
        console.error('Something went wrong')
      }
    }
  
    function onCancel(self: AddRelative) {
      if (!self.is_active) return
      self.is_active = false
      self.store.state.one_level_rels = false
  
      self.cleanUp()
      self.cancelCallback(self.datum!)
  
      self.datum = null
      self.onChange = null
      self.onCancel = null
    }
  
  }
  
  setAddRelLabels(add_rel_labels: AddRelative['addRelLabels']) {
    if (typeof add_rel_labels !== 'object') {
      console.error('add_rel_labels must be an object')
      return
    }
    for (const key in add_rel_labels) {
      const key_str = key as keyof AddRelative['addRelLabels']
      this.addRelLabels[key_str] = add_rel_labels[key_str]
    }
    return this
  }

  setCanAdd(canAdd: AddRelative['canAdd']) {
    this.canAdd = canAdd
    return this
  }
  
  addRelLabelsDefault() {
    return {
      father: 'Add Father',
      mother: 'Add Mother',
      spouse: 'Add Spouse',
      son: 'Add Son',
      daughter: 'Add Daughter'
    }
  }
  
  getStoreData() {
    return this.store.getData()
  }
  
  cleanUp(data?: Data | undefined) {
    if (!data) data = this.store.getData()
    cleanUp(data)
  
    return data
  }
}