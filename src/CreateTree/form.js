import {checkIfRelativesConnectedWithoutPerson} from "./checkIfRelativesConnectedWithoutPerson.js"
import {createTreeDataWithMainNode} from "./newPerson.js"

export function createForm({datum, store, fields, postSubmit, addRelative, deletePerson, onCancel, editFirst}) {
  const form_creator = {
    fields: [],
    onSubmit: submitFormChanges,
  }
  if (!datum._new_rel_data) {
    form_creator.onDelete = deletePersonWithPostSubmit
    form_creator.addRelative = () => addRelative.activate(datum),
    form_creator.addRelativeCancel = () => addRelative.onCancel()
    form_creator.addRelativeActive = addRelative.is_active

    form_creator.editable = false
  }
  if (datum._new_rel_data) {
    form_creator.title = datum._new_rel_data.label
    form_creator.new_rel = true
    form_creator.editable = true
    form_creator.onCancel = onCancel
  }
  if (form_creator.onDelete) form_creator.can_delete = checkIfRelativesConnectedWithoutPerson(datum, store.getData())

  if (editFirst) form_creator.editable = true

  const childred_added = (datum.rels.children || []).some(c_id => {const child = store.getDatum(c_id); return !child._new_rel_data})

  form_creator.gender_field = {
    id: 'gender', 
    type: 'switch',
    label: 'Gender',
    initial_value: datum.data.gender,
    disabled: ['father', 'mother'].some(rel => rel === datum._new_rel_data?.rel_type) || childred_added,
    options: [{value: 'M', label: 'Male'}, {value: 'F', label: 'Female'}]
  }

  fields.forEach(field => {
    if (field.type === 'rel_reference') addRelReferenceField(field)
    else if (field.type === 'select') addSelectField(field)

    else form_creator.fields.push({
      id: field.id,
      type: field.type,
      label: field.label,
      initial_value: datum.data[field.id],
    })
  })

  return form_creator

  function addRelReferenceField(field) {
    if (!field.getRelLabel) console.error('getRelLabel is not set')

    if (field.rel_type === 'spouse') {
      (datum.rels.spouses || []).forEach(spouse_id => {
        const spouse = store.getDatum(spouse_id)
        const marriage_date_id = `${field.id}__ref__${spouse_id}`
        
        form_creator.fields.push({
          id: marriage_date_id,
          type: 'rel_reference',
          label: field.label,
          rel_id: spouse_id,
          rel_label: field.getRelLabel(spouse),
          initial_value: datum.data[marriage_date_id],
        })
        
      })
    }
  }

  function addSelectField(field) {
    if (!field.optionCreator) return
    form_creator.fields.push({
      id: field.id,
      type: field.type,
      label: field.label,
      initial_value: datum.data[field.id],
      options: field.optionCreator(datum),
    })
  }

  function submitFormChanges(e) {
    e.preventDefault()
    const form_data = new FormData(e.target)
    form_data.forEach((v, k) => datum.data[k] = v)
    syncRelReference(datum, store.getData())
    if (datum.to_add) delete datum.to_add
    postSubmit()
  }

  function deletePersonWithPostSubmit() {
    deletePerson()
    postSubmit({delete: true})
  }
}

export function syncRelReference(datum, data_stash) {
  Object.keys(datum.data).forEach(k => {
    if (k.includes('__ref__')) {
      const rel_id = k.split('__ref__')[1]
      const rel = data_stash.find(d => d.id === rel_id)
      if (!rel) return
      const ref_field_id = k.split('__ref__')[0]+'__ref__'+datum.id
      rel.data[ref_field_id] = datum.data[k]
    }
  })
}

export function onDeleteSyncRelReference(datum, data_stash) {
  Object.keys(datum.data).forEach(k => {
    if (k.includes('__ref__')) {
      const rel_id = k.split('__ref__')[1]
      const rel = data_stash.find(d => d.id === rel_id)
      if (!rel) return
      const ref_field_id = k.split('__ref__')[0]+'__ref__'+datum.id
      delete rel.data[ref_field_id]
    }
  })
}

export function moveToAddToAdded(datum, data_stash) {
  delete datum.to_add
  return datum
}

export function removeToAdd(datum, data_stash) {
  deletePerson(datum, data_stash)
  return false
}

export function deletePerson(datum, data_stash) {
  if (!checkIfRelativesConnectedWithoutPerson(datum, data_stash)) return {success: false, error: 'checkIfRelativesConnectedWithoutPerson'}
  executeDelete()
  return {success: true};

  function executeDelete() {
    data_stash.forEach(d => {
      for (let k in d.rels) {
        if (!d.rels.hasOwnProperty(k)) continue
        if (d.rels[k] === datum.id) {
          delete d.rels[k]
        } else if (Array.isArray(d.rels[k]) && d.rels[k].includes(datum.id)) {
          d.rels[k].splice(d.rels[k].findIndex(did => did === datum.id), 1)
        }
      }
    })
    onDeleteSyncRelReference(datum, data_stash)
    data_stash.splice(data_stash.findIndex(d => d.id === datum.id), 1)
    data_stash.forEach(d => {if (d.to_add) deletePerson(d, data_stash)})  // full update of tree
    if (data_stash.length === 0) data_stash.push(createTreeDataWithMainNode({}).data[0])
  }
}

export function cleanupDataJson(data) {
  data.forEach(d => d.to_add ? removeToAdd(d, data) : d)
  data.forEach(d => delete d.main)
  data.forEach(d => delete d.hide_rels)
  return data
}

export function removeToAddFromData(data) {
  data.forEach(d => d.to_add ? removeToAdd(d, data) : d)
  return data
}