import {checkIfRelativesConnectedWithoutPerson} from "../handlers/check-person-connection"
import {createTreeDataWithMainNode} from "./new-person"

export function submitFormData(datum, data_stash, form_data) {
  form_data.forEach((v, k) => datum.data[k] = v)
  syncRelReference(datum, data_stash)
  if (datum.to_add) delete datum.to_add
  if (datum.unknown) delete datum.unknown
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