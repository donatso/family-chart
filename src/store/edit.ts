import {checkIfRelativesConnectedWithoutPerson} from "../handlers/check-person-connection"
import { Data, Datum } from "../types/data"
import {createNewPerson} from "./new-person"

export function submitFormData(datum: Datum, data_stash: Data, form_data: FormData) {
  form_data.forEach((v, k) => datum.data[k] = v)
  syncRelReference(datum, data_stash)
  if (datum.to_add) delete datum.to_add
  if (datum.unknown) delete datum.unknown
}

export function syncRelReference(datum: Datum, data_stash: Data) {
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

export function onDeleteSyncRelReference(datum: Datum, data_stash: Data) {
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

export function moveToAddToAdded(datum: Datum, data_stash: Data) {
  delete datum.to_add
  return datum
}

export function removeToAdd(datum: Datum, data_stash: Data) {
  deletePerson(datum, data_stash)
  return false
}

export function deletePerson(datum: Datum, data_stash: Data) {
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
        const key = k as keyof Datum['rels'];
        if (d.rels[key] === datum.id) {
          delete d.rels[key]
        } else if (Array.isArray(d.rels[key]) && d.rels[key].includes(datum.id)) {
          d.rels[key].splice(d.rels[key].findIndex(did => did === datum.id), 1)
        }
      }
    })
    onDeleteSyncRelReference(datum, data_stash)
    data_stash.splice(data_stash.findIndex(d => d.id === datum.id), 1)
    if (data_stash.length === 0) data_stash.push(createNewPerson({data: {gender: 'M'}}))
  }

  function changeToUnknown() {
    onDeleteSyncRelReference(datum, data_stash)
    datum.data = {
      gender: datum.data.gender,
    }
    datum.unknown = true
  }
}

export function cleanupDataJson(data: Data) {
  removeToAddFromData(data)
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

export function removeToAddFromData(data: Data) {
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].to_add) removeToAdd(data[i], data)
  }
}