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

  form_creator.gender_field = {
    id: 'gender', 
    type: 'switch',
    label: 'Gender',
    initial_value: datum.data.gender,
    options: [{value: 'M', label: 'Male'}, {value: 'F', label: 'Female'}]
  }

  fields.forEach(d => {
    const field = {
      id: d.id,
      type: d.type,
      label: d.label,
      initial_value: datum.data[d.id],
    }
    form_creator.fields.push(field)
  })

  return form_creator

  function submitFormChanges(e) {
    e.preventDefault()
    const form_data = new FormData(e.target)
    form_data.forEach((v, k) => datum.data[k] = v)
    if (datum.to_add) delete datum.to_add
    postSubmit()
  }

  function deletePersonWithPostSubmit() {
    deletePerson()
    postSubmit({delete: true})
  }
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
    data_stash.splice(data_stash.findIndex(d => d.id === datum.id), 1)
    data_stash.forEach(d => {if (d.to_add) deletePerson(d, data_stash)})  // full update of tree
    if (data_stash.length === 0) data_stash.push(createTreeDataWithMainNode({}).data[0])
  }
}

export function cleanupDataJson(data_json) {
  let data_no_to_add = JSON.parse(data_json)
  data_no_to_add.forEach(d => d.to_add ? removeToAdd(d, data_no_to_add) : d)
  data_no_to_add.forEach(d => delete d.main)
  data_no_to_add.forEach(d => delete d.hide_rels)
  return JSON.stringify(data_no_to_add, null, 2)
}

export function removeToAddFromData(data) {
  data.forEach(d => d.to_add ? removeToAdd(d, data) : d)
  return data
}