export function moveToAddToAdded(datum, data_stash) {
  delete datum.to_add
  return datum
}

export function removeToAdd(datum, data_stash) {
  deletePerson(datum, data_stash)
  return false
}

export function removeAllToAdd(data_stash) {
  data_stash.slice(0).forEach(d => {
    d.to_add ? removeToAdd(d, data_stash) : ''
  })
}

export function getLabel(datum) {
  if (datum.data.fn || datum.data.ln) return `${datum.data.fn || ''} ${datum.data.ln || ''}`
  else return 'UNKNOWN'
}

export function deletePerson(datum, data_stash) {
  data_stash.forEach(d => {
    for (let k in d.rels) {
      if (!d.rels.hasOwnProperty(k)) continue
      if (d.rels[k] === datum.id) {
        delete d.rels[k]
      } else if (Array.isArray(d.rels[k]) && d.rels[k].includes(datum.id)) {
        d.rels[k].splice(d.rels[k].findIndex(did => did === datum.id, 1))
      }
    }
  })
  data_stash.splice(data_stash.findIndex(d => d === datum), 1)

  if (datum.rels.spouses) {  // if person have spouse holder we delete that as well
    datum.rels.spouses.forEach(sp_id => {
      const spouse = data_stash.find(d => d.id === sp_id)
      if (spouse.to_add) deletePerson(spouse, data_stash)
    })
  }
}
