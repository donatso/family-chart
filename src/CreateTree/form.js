import {checkIfRelativesConnectedWithoutPerson} from "./checkPersonConnection.js"
import {createTreeDataWithMainNode} from "./newPerson.js"
import { getLinkRelOptions } from "./addRelative.linkRel.js"

export function createForm({
  datum,
  store,
  fields,
  postSubmit,
  addRelative,
  removeRelative,
  deletePerson,
  onCancel,
  editFirst,
  link_existing_rel_config,
  getKinshipInfo,
  onFormCreation
}) {
  const form_creator = {
    datum_id: datum.id,
    fields: [],
    onSubmit: submitFormChanges,
    getKinshipInfo: getKinshipInfo,
    onFormCreation: onFormCreation
  }
  if (!datum._new_rel_data) {
    form_creator.onDelete = deletePersonWithPostSubmit
    form_creator.addRelative = () => addRelative.activate(datum),
    form_creator.addRelativeCancel = () => addRelative.onCancel()
    form_creator.addRelativeActive = addRelative.is_active

    form_creator.removeRelative = () => removeRelative.activate(datum),
    form_creator.removeRelativeCancel = () => removeRelative.onCancel()
    form_creator.removeRelativeActive = removeRelative.is_active

    form_creator.editable = false
  }
  if (datum._new_rel_data) {
    form_creator.title = datum._new_rel_data.label
    form_creator.new_rel = true
    form_creator.editable = true
    form_creator.onCancel = onCancel
  }
  if (datum._new_rel_data || datum.to_add || datum.unknown) {
    if (link_existing_rel_config) form_creator.linkExistingRelative = createLinkExistingRelative(datum, store.getData(), link_existing_rel_config)
  }

  if (form_creator.onDelete) form_creator.can_delete = true

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
    if (!field.optionCreator && !field.options) return console.error('optionCreator or options is not set for field', field)
    form_creator.fields.push({
      id: field.id,
      type: field.type,
      label: field.label,
      initial_value: datum.data[field.id],
      placeholder: field.placeholder,
      options: field.options || field.optionCreator(datum),
    })
  }

  function createLinkExistingRelative(datum, data, link_existing_rel_config) {
    const obj = {
      label: link_existing_rel_config.label,
      options: getLinkRelOptions(datum, data)
        .map(d => ({value: d.id, label: link_existing_rel_config.linkRelLabel(d)}))
        .sort((a, b) => {
          if (typeof a.label === 'string' && typeof b.label === 'string') return a.label.localeCompare(b.label)
          else return a.label < b.label ? -1 : 1
        }),
      onSelect: submitLinkExistingRelative
    }
    return obj


  }

  function submitFormChanges(e) {
    e.preventDefault()
    const form_data = new FormData(e.target)
    form_data.forEach((v, k) => datum.data[k] = v)
    syncRelReference(datum, store.getData())
    if (datum.to_add) delete datum.to_add
    if (datum.unknown) delete datum.unknown
    postSubmit()
  }

  function submitLinkExistingRelative(e) {
    const link_rel_id = e.target.value
    postSubmit({link_rel_id: link_rel_id})
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
  if (!checkIfRelativesConnectedWithoutPerson(datum, data_stash)) {
    changeToUnknown()
    return {success: true}
  } else {
    executeDelete()
    return {success: true};
  }

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

  function changeToUnknown() {
    onDeleteSyncRelReference(datum, data_stash)
    datum.data = {
      gender: datum.data.gender,
    }
    datum.unknown = true
  }
}

export function cleanupDataJson(data) {
  data.forEach(d => d.to_add ? removeToAdd(d, data) : d)
  data.forEach(d => {
    delete d.main
    delete d._tgdp
    delete d._tgdp_sp
    delete d.__tgdp_sp
  })
  data.forEach(d => {
    Object.keys(d).forEach(k => {
      if (k[0] === '_') console.error('key starts with _', k)
    })
  })
  return data
}

export function removeToAddFromData(data) {
  data.forEach(d => d.to_add ? removeToAdd(d, data) : d)
  return data
}