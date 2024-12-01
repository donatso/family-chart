import { handleNewRel, createNewPerson } from "./newPerson.js"

export default (...args) => { return new AddRelative(...args) }

function AddRelative(store, datum, activateCallback, cancelCallback) {
  console.log('addRelative', datum)
  this.store = store
  this.datum = datum

  this.onSubmit = null
  this.onCancel = null

  this.activateCallback = activateCallback
  this.cancelCallback = cancelCallback
  return this
}

AddRelative.prototype.activate = function() {
  this.activateCallback(this)
  const store = this.store

  const store_data = store.getData()
  const datum = JSON.parse(JSON.stringify(this.datum))

  const datum_rels = getDatumRels(datum, store_data)

  if (!datum.rels.father) {
    const father = createNewPerson({data: {gender: "M", label: "Add Father"}, rels: {children: [datum.id]}})
    father._new_rel_data = {rel_type: "father", rel_datum: datum}
    datum.rels.father = father.id
    datum_rels.push(father)
  }
  if (!datum.rels.mother) {
    const mother = createNewPerson({data: {gender: "F", label: "Add Mother"}, rels: {children: [datum.id]}})
    mother._new_rel_data = {rel_type: "mother", rel_datum: datum}
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
  const new_spouse = createNewPerson({data: {gender: "F", label: "Add Spouse"}, rels: {spouses: [datum.id]}})
  new_spouse._new_rel_data = {rel_type: "spouse", rel_datum: datum}
  datum.rels.spouses.push(new_spouse.id)
  datum_rels.push(new_spouse)

  if (!datum.rels.children) datum.rels.children = []
  datum.rels.spouses.forEach(spouse_id => {
    const spouse = datum_rels.find(d => d.id === spouse_id)
    if (!spouse.rels.children) spouse.rels.children = []
    
    const new_son = createNewPerson({data: {gender: "M", label: "Add Son"}, rels: {father: datum.id, mother: spouse.id}})
    new_son._new_rel_data = {rel_type: "son", rel_datum: datum}
    spouse.rels.children.push(new_son.id)
    datum.rels.children.push(new_son.id)
    datum_rels.push(new_son)

    const new_daughter = createNewPerson({data: {gender: "F", label: "Add Daughter"}, rels: {mother: spouse.id, father: datum.id}})
    new_daughter._new_rel_data = {rel_type: "daughter", rel_datum: datum}
    spouse.rels.children.push(new_daughter.id)
    datum.rels.children.push(new_daughter.id)
    datum_rels.push(new_daughter)
  })

  store.updateData(datum_rels)
  store.updateTree({})

  this.onSubmit = onSubmit
  this.onCancel = onCancel

  function onSubmit(new_rel_datum) {
    store.updateData(store_data)
    console.log(store_data)
    handleNewRel({datum: this.datum, new_rel_datum, data_stash: store_data})

    console.log(store.getData())

    store.updateMainId(datum.id)
    store.updateTree({})
  }

  function onCancel() {
    store.updateData(store_data)
    store.updateMainId(datum.id)
    this.cancelCallback()
  }

}

function findRel(store_data, id) {getDatumRels
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