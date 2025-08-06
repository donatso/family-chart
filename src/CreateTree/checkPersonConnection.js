export function checkIfRelativesConnectedWithoutPerson(datum, data_stash) {
  const r = datum.rels
  const r_ids = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(r_id => !!r_id)
  for (const r_id of r_ids) {
    const person = data_stash.find(d => d.id === r_id)
    if (!checkIfConnectedToFirstPerson(person, data_stash, [datum.id])) return false
  }
  return true
}

export function checkIfConnectedToFirstPerson(datum, data_stash, exclude_ids = []) {
  const first_person = data_stash[0]
  if (datum.id === first_person.id) return true

  const rels_checked = [...exclude_ids]
  let connected = false
  checkRels(datum)
  return connected

  function checkRels(d0) {
    if (connected) return
    const r = d0.rels
    const r_ids = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(r_id => !!r_id)
    r_ids.forEach(r_id => {
      if (rels_checked.includes(r_id)) return
      rels_checked.push(r_id)
      const person = data_stash.find(d => d.id === r_id)
      if (person.id === first_person.id) connected = true
      else checkRels(person)
    })
  }
}