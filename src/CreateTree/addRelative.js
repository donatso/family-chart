import { createNewPerson } from "./newPerson.js"

export default (...args) => { return new AddRelative(...args) }

function AddRelative(store, cancelCallback) {
  this.store = store

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
  this.is_active = true

  const store = this.store

  this.datum = datum
  let gender_stash = this.datum.data.gender

  addDatumRelsPlaceholders(datum, this.getStoreData(), this.addRelLabels)
  store.updateTree({})

  this.onChange = onChange.bind(this)
  this.onCancel = onCancel.bind(this)

  function onChange(updated_datum, props) {
    if (updated_datum?._new_rel_data) {
      if (props?.link_rel_id) handleLinkRel(updated_datum, props.link_rel_id, store.getData())
      else delete updated_datum._new_rel_data
    } else if (updated_datum.id === datum.id) {
      if (updated_datum.data.gender !== gender_stash) updateGendersForNewRelatives()
    } else {
      console.error('Something went wrong')
    }

    function updateGendersForNewRelatives() {
      gender_stash = updated_datum.data.gender
      // if gender on main datum is changed, we need to switch mother/father ids for new children
      const data = store.getData()
      data.forEach(d => {
        const rd = d._new_rel_data
        if (!rd) return
        if (rd.rel_type === 'spouse') d.data.gender = d.data.gender === 'M' ? 'F' : 'M'
        if (['son', 'daughter'].includes(rd.rel_type)) {
          [d.rels.father, d.rels.mother] = [d.rels.mother, d.rels.father]
        }
      })
    }
  }

  function onCancel() {
    if (!this.is_active) return
    this.is_active = false

    this.cleanUp()
    this.cancelCallback(this.datum)

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
  return this.store.getData()
}

AddRelative.prototype.cleanUp = function(data) {
  if (!data) data = this.store.getData()
  for (let i = data.length - 1; i >= 0; i--) {
    const d = data[i]
    if (d._new_rel_data) {
      data.forEach(d2 => {
        if (d2.rels.father === d.id) delete d2.rels.father
        if (d2.rels.mother === d.id) delete d2.rels.mother
        if ((d2.rels.children || []).includes(d.id)) d2.rels.children.splice(d2.rels.children.indexOf(d.id), 1)
        if ((d2.rels.spouses || []).includes(d.id)) d2.rels.spouses.splice(d2.rels.spouses.indexOf(d.id), 1)
      })
      data.splice(i, 1)
    } else if (d.__rels) {
      if (d.__rels.father) d.rels.father = d.__rels.father
      if (d.__rels.mother) d.rels.mother = d.__rels.mother
      if (d.__rels.children) d.__rels.children.forEach(child_id => { if (!d.rels.children.includes(child_id)) d.rels.children.push(child_id) })
      if (d.__rels.spouses) d.__rels.spouses.forEach(spouse_id => { if (!d.rels.spouses.includes(spouse_id)) d.rels.spouses.push(spouse_id) })
      delete d.__rels
    }
  }

  return data
}

function addDatumRelsPlaceholders(datum, store_data, addRelLabels) {
  setDatumRels(datum, store_data)

  if (!datum.rels.father) {
    const father = createNewPerson({data: {gender: "M"}, rels: {children: [datum.id]}})
    father._new_rel_data = {rel_type: "father", label: addRelLabels.father}
    datum.rels.father = father.id
    store_data.push(father)
  }
  if (!datum.rels.mother) {
    const mother = createNewPerson({data: {gender: "F"}, rels: {children: [datum.id]}})
    mother._new_rel_data = {rel_type: "mother", label: addRelLabels.mother}
    datum.rels.mother = mother.id
    store_data.push(mother)
  }
  const mother = store_data.find(d => d.id === datum.rels.mother)
  const father = store_data.find(d => d.id === datum.rels.father)
  mother.rels.spouses = [father.id]
  father.rels.spouses = [mother.id]

  mother.rels.children = [datum.id]
  father.rels.children = [datum.id]

  if (!datum.rels.spouses) datum.rels.spouses = []

  if (datum.rels.children) {
    let new_spouse;
    datum.rels.children.forEach(child_id => {
      const child = store_data.find(d => d.id === child_id)
      if (!child.rels.mother) {
        if (!new_spouse) new_spouse = createNewPerson({data: {gender: "F"}, rels: {spouses: [datum.id], children: []}})
        new_spouse._new_rel_data = {rel_type: "spouse", label: addRelLabels.spouse}
        new_spouse.rels.children.push(child.id)
        datum.rels.spouses.push(new_spouse.id)
        child.rels.mother = new_spouse.id
        store_data.push(new_spouse)
      }
      if (!child.rels.father) {
        if (!new_spouse) new_spouse = createNewPerson({data: {gender: "M"}, rels: {spouses: [datum.id], children: []}})
        new_spouse._new_rel_data = {rel_type: "spouse", label: addRelLabels.spouse}
        new_spouse.rels.children.push(child.id)
        datum.rels.spouses.push(new_spouse.id)
        child.rels.father = new_spouse.id
        store_data.push(new_spouse)
      }
    })
  }

  const spouse_gender = datum.data.gender === "M" ? "F" : "M"
  const new_spouse = createNewPerson({data: {gender: spouse_gender}, rels: {spouses: [datum.id]}})
  new_spouse._new_rel_data = {rel_type: "spouse", label: addRelLabels.spouse}
  datum.rels.spouses.push(new_spouse.id)
  store_data.push(new_spouse)

  if (!datum.rels.children) datum.rels.children = []
  datum.rels.spouses.forEach(spouse_id => {
    const spouse = store_data.find(d => d.id === spouse_id)
    const mother_id = datum.data.gender === "M" ? spouse.id : datum.id
    const father_id = datum.data.gender === "F" ? spouse.id : datum.id
    if (!spouse.rels.children) spouse.rels.children = []
    spouse.rels.children = spouse.rels.children.filter(child_id => datum.rels.children.includes(child_id))
    
    const new_son = createNewPerson({data: {gender: "M"}, rels: {father: father_id, mother: mother_id}})
    new_son._new_rel_data = {rel_type: "son", label: addRelLabels.son, other_parent_id: spouse.id}
    spouse.rels.children.push(new_son.id)
    datum.rels.children.push(new_son.id)
    store_data.push(new_son)

    const new_daughter = createNewPerson({data: {gender: "F"}, rels: {mother: mother_id, father: father_id}})
    new_daughter._new_rel_data = {rel_type: "daughter", label: addRelLabels.daughter, other_parent_id: spouse.id}
    spouse.rels.children.push(new_daughter.id)
    datum.rels.children.push(new_daughter.id)
    store_data.push(new_daughter)
  })

  return store_data
}

function setDatumRels(datum, data) {
  datum.__rels = JSON.parse(JSON.stringify(datum.rels))
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
    const rel_datum = data.find(d => d.id === rel_id)
    rel_datum.__rels = JSON.parse(JSON.stringify(rel_datum.rels))

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

function handleLinkRel(updated_datum, link_rel_id, store_data) {
  const new_rel_id = updated_datum.id

  store_data.forEach(d => {
    if (d.rels.father === new_rel_id) d.rels.father = link_rel_id
    if (d.rels.mother === new_rel_id) d.rels.mother = link_rel_id
    if ((d.rels.spouses || []).includes(new_rel_id)) {
      d.rels.spouses = d.rels.spouses.filter(id => id !== new_rel_id)
      if (!d.rels.spouses.includes(link_rel_id)) d.rels.spouses.push(link_rel_id)
    }
    if ((d.rels.children || []).includes(new_rel_id)) {
      d.rels.children = d.rels.children.filter(id => id !== new_rel_id)
      if (!d.rels.children.includes(link_rel_id)) d.rels.children.push(link_rel_id)
    }
  })

  const link_rel = store_data.find(d => d.id === link_rel_id)
  const new_rel = store_data.find(d => d.id === new_rel_id);
  (new_rel.rels.children || []).forEach(child_id => {
    if (!link_rel.rels.children) link_rel.rels.children = []
    if (!link_rel.rels.children.includes(child_id)) link_rel.rels.children.push(child_id)
  });
  (new_rel.rels.spouses || []).forEach(spouse_id => {
    if (!link_rel.rels.spouses) link_rel.rels.spouses = []
    if (!link_rel.rels.spouses.includes(spouse_id)) link_rel.rels.spouses.push(spouse_id)
  })

  if (!link_rel.rels.father && new_rel.rels.father) link_rel.rels.father = new_rel.rels.father  // needed?
  if (!link_rel.rels.mother && new_rel.rels.mother) link_rel.rels.mother = new_rel.rels.mother  // needed?

  store_data.splice(store_data.findIndex(d => d.id === new_rel_id), 1)
}