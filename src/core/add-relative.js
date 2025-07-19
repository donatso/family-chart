import { handleLinkRel } from "../store/add-existing-rel"
import { addDatumRelsPlaceholders, cleanUp, updateGendersForNewRelatives } from "../store/add-relative"

export default (...args) => { return new AddRelative(...args) }

function AddRelative(store, onActivate, cancelCallback) {
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

AddRelative.prototype.activate = function(datum) {
  if (this.is_active) this.onCancel()
  this.onActivate()
  this.is_active = true
  this.store.state.one_level_rels = true

  const store = this.store

  this.datum = datum
  let gender_stash = this.datum.data.gender

  addDatumRelsPlaceholders(datum, this.getStoreData(), this.addRelLabels)
  store.updateTree({})

  this.onChange = onChange
  this.onCancel = () => onCancel(this)

  function onChange(updated_datum, props) {
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

  function onCancel(self) {
    if (!self.is_active) return
    self.is_active = false
    self.store.state.one_level_rels = false

    self.cleanUp()
    self.cancelCallback(self.datum)

    self.datum = null
    self.onChange = null
    self.onCancel = null
  }

}

AddRelative.prototype.setAddRelLabels = function(add_rel_labels) {
  if (typeof add_rel_labels !== 'object') {
    console.error('add_rel_labels must be an object')
    return
  }
  for (let key in add_rel_labels) {
    this.addRelLabels[key] = add_rel_labels[key]
  }
  return this
}

AddRelative.prototype.addRelLabelsDefault = function() {
  return {
    father: 'Add Father',
    mother: 'Add Mother',
    spouse: 'Add Spouse',
    son: 'Add Son',
    daughter: 'Add Daughter'
  }
}

AddRelative.prototype.getStoreData = function() {
  return this.store.getData()
}

AddRelative.prototype.cleanUp = function(data) {
  if (!data) data = this.store.getData()
  cleanUp(data)

  return data
}