import { handleNewRel, createNewPerson } from "./newPerson.js"

export default (...args) => { return new AddRelative(...args) }

function AddRelative(store, cancelCallback, onSubmitCallback) {
  this.store = store

  this.cancelCallback = cancelCallback
  this.onSubmitCallback = onSubmitCallback

  this.datum = null

  this.onChange = null
  this.onCancel = null

  this.is_active = false
  this.store_data = null

  this.addRelLabels = this.addRelLabelsDefault()

  return this
}

AddRelative.prototype.activate = function(datum) {
  if (this.is_active) this.onCancel()
  this.is_active = true

  const store = this.store

  this.store_data = store.getData()
  this.datum = datum
  datum = JSON.parse(JSON.stringify(this.datum))

  const datum_rels = getDatumRelsData(datum, this.getStoreData(), this.addRelLabels)
  store.updateData(datum_rels)
  store.updateTree({})

  this.onChange = onChange.bind(this)
  this.onCancel = onCancel.bind(this)

  function onChange(updated_datum) {
    if (updated_datum?._new_rel_data) {
      const new_rel_datum = updated_datum
      handleNewRel({datum: this.datum, new_rel_datum, data_stash: this.getStoreData()})
      this.onSubmitCallback(this.datum, new_rel_datum)
    } else if (updated_datum.id === this.datum.id) {
      this.datum.data = updated_datum.data  // if in meanwhile the user changed the data for main datum, we need to keep it
    } else {
      console.error('Something went wrong')
    }
  }

  function onCancel() {
    if (!this.is_active) return
    this.is_active = false

    store.updateData(this.getStoreData())
    this.cancelCallback(this.datum)

    this.store_data = null
    this.datum = null
    this.onChange = null
    this.onCancel = null
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
  return this.store_data
}

function getDatumRelsData(datum, store_data, addRelLabels) {
  const datum_rels = getDatumRels(datum, store_data)

  if (!datum.rels.father) {
    const father = createNewPerson({data: {gender: "M"}, rels: {children: [datum.id]}})
    father._new_rel_data = {rel_type: "father", label: addRelLabels.father}
    datum.rels.father = father.id
    datum_rels.push(father)
  }
  if (!datum.rels.mother) {
    const mother = createNewPerson({data: {gender: "F"}, rels: {children: [datum.id]}})
    mother._new_rel_data = {rel_type: "mother", label: addRelLabels.mother}
    datum.rels.mother = mother.id
    datum_rels.push(mother)
  }
  const mother = datum_rels.find(d => d.id === datum.rels.mother)
  const father = datum_rels.find(d => d.id === datum.rels.father)
  mother.rels.spouses = [father.id]
  father.rels.spouses = [mother.id]

  mother.rels.children = [datum.id]
  father.rels.children = [datum.id]

  if (!datum.rels.spouses) datum.rels.spouses = []

  if (datum.rels.children) {
    let new_spouse;
    datum.rels.children.forEach(child_id => {
      const child = datum_rels.find(d => d.id === child_id)
      if (!child.rels.mother) {
        if (!new_spouse) new_spouse = createNewPerson({data: {gender: "F"}, rels: {spouses: [datum.id], children: []}})
        new_spouse._new_rel_data = {rel_type: "spouse", label: addRelLabels.spouse}
        new_spouse.rels.children.push(child.id)
        datum.rels.spouses.push(new_spouse.id)
        child.rels.mother = new_spouse.id
        datum_rels.push(new_spouse)
      }
      if (!child.rels.father) {
        if (!new_spouse) new_spouse = createNewPerson({data: {gender: "M"}, rels: {spouses: [datum.id], children: []}})
        new_spouse._new_rel_data = {rel_type: "spouse", label: addRelLabels.spouse}
        new_spouse.rels.children.push(child.id)
        datum.rels.spouses.push(new_spouse.id)
        child.rels.father = new_spouse.id
        datum_rels.push(new_spouse)
      }
    })
  }

  const new_spouse = createNewPerson({data: {gender: "F"}, rels: {spouses: [datum.id]}})
  new_spouse._new_rel_data = {rel_type: "spouse", label: addRelLabels.spouse}
  datum.rels.spouses.push(new_spouse.id)
  datum_rels.push(new_spouse)

  if (!datum.rels.children) datum.rels.children = []
  datum.rels.spouses.forEach(spouse_id => {
    const spouse = datum_rels.find(d => d.id === spouse_id)
    if (!spouse.rels.children) spouse.rels.children = []
    spouse.rels.children = spouse.rels.children.filter(child_id => datum.rels.children.includes(child_id))
    
    const new_son = createNewPerson({data: {gender: "M"}, rels: {father: datum.id, mother: spouse.id}})
    new_son._new_rel_data = {rel_type: "son", label: addRelLabels.son, other_parent_id: spouse.id}
    spouse.rels.children.push(new_son.id)
    datum.rels.children.push(new_son.id)
    datum_rels.push(new_son)

    const new_daughter = createNewPerson({data: {gender: "F"}, rels: {mother: spouse.id, father: datum.id}})
    new_daughter._new_rel_data = {rel_type: "daughter", label: addRelLabels.daughter, other_parent_id: spouse.id}
    spouse.rels.children.push(new_daughter.id)
    datum.rels.children.push(new_daughter.id)
    datum_rels.push(new_daughter)
  })

  return datum_rels
}

function findRel(store_data, id) {
  return JSON.parse(JSON.stringify(store_data.find(d => d.id === id)))
}

function getDatumRels(datum, data) {
  const datum_rels = [datum]
  Object.keys(datum.rels).forEach(rel_type => {
    const rel = datum.rels[rel_type]
    if (Array.isArray(rel)) {
      rel.forEach(rel_id => {
        findAndPushRel(rel_type, rel_id)
      })
    } else {
      findAndPushRel(rel_type, rel)
    }
  })
  return datum_rels

  function findAndPushRel(rel_type, rel_id) {
    const rel_datum = findRel(data, rel_id)
    if (rel_type === 'father' || rel_type === 'mother') {
      delete rel_datum.rels.father
      delete rel_datum.rels.mother
    }

    if (rel_type === 'children') {
      rel_datum.rels.children = []
      rel_datum.rels.spouses = []
    }

    datum_rels.push(rel_datum)
  }
}