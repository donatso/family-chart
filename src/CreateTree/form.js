import {checkIfRelativesConnectedWithoutPerson} from "./checkIfRelativesConnectedWithoutPerson.js"
import {createTreeDataWithMainNode} from "./newPerson.js"

export function createForm({datum, rel_datum, store, rel_type, card_edit, postSubmit, card_display}) {
  const form_creator = {
    fields: [],
    onSubmit: submitFormChanges,
  }

  if (!datum.to_add && !rel_datum) form_creator.onDelete = deletePerson

  form_creator.gender_field = {
    id: 'gender', 
    type: 'switch',
    label: 'Gender',
    initial_value: datum.data.gender,
    options: [{value: 'M', label: 'Male'}, {value: 'F', label: 'Female'}]
  }

  if (rel_type === "son" || rel_type === "daughter") {
    const other_parent =  {
      id: 'other_parent',
      type: 'select',
      label: 'Select other parent',
      initial_value: null,
      options: []
    }
    if (rel_datum.rels.spouses && rel_datum.rels.spouses.length > 0) {
      other_parent.initial_value = rel_datum.rels.spouses[0]
      other_parent.options.push(...getOtherParentOptions())
    }
    other_parent.options.push({value: '_new', label: 'NEW'})
    form_creator.other_parent_field = other_parent

    function getOtherParentOptions() {
      const options = []
      const data_stash = store.getData();
      const spouses = rel_datum.rels.spouses || []
      spouses.forEach((sp_id, i) => {
        const spouse = data_stash.find(d => d.id === sp_id)
        options.push({value: sp_id, label: card_display[0](spouse)})
      })
      return options
    }
  }

  card_edit.forEach(d => {
    const field = {
      id: d.key,
      type: d.type,
      label: d.placeholder,
      initial_value: datum.data[d.key],
    }
    form_creator.fields.push(field)
  })

  return form_creator

  function submitFormChanges(e) {
    e.preventDefault()
    const form_data = new FormData(e.target)
    form_data.forEach((v, k) => datum.data[k] = v)

    postSubmit()
  }

  function deletePerson() {
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