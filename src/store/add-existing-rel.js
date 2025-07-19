export function handleLinkRel(updated_datum, link_rel_id, store_data) {
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

  if (link_rel.rels.father && new_rel.rels.father) console.error('link rel already has father')
  if (link_rel.rels.mother && new_rel.rels.mother) console.error('link rel already has mother')

  if (new_rel.rels.father) link_rel.rels.father = new_rel.rels.father
  if (new_rel.rels.mother) link_rel.rels.mother = new_rel.rels.mother

  store_data.splice(store_data.findIndex(d => d.id === new_rel_id), 1)
}

export function getLinkRelOptions(datum, data) {
  const rel_datum = datum._new_rel_data ? data.find(d => d.id === datum._new_rel_data.rel_id) : null
  const ancestry_ids = getAncestry(datum, data)
  const progeny_ids = getProgeny(datum, data)
  if (datum._new_rel_data && ['son', 'daughter'].includes(datum._new_rel_data.rel_type)) progeny_ids.push(...getProgeny(rel_datum, data))

  return data.filter(d => d.id !== datum.id && d.id !== rel_datum?.id && !d._new_rel_data && !d.to_add && !d.unknown)
    .filter(d => !ancestry_ids.includes(d.id))
    .filter(d => !progeny_ids.includes(d.id))
    .filter(d => !(d.rels.spouses || []).includes(datum.id))


  function getAncestry(datum, data_stash) {
    const ancestry_ids = []
    loopCheck(datum)
    return ancestry_ids

    function loopCheck(d) {
      const parents = [d.rels.father, d.rels.mother]
      parents.forEach(p_id => {
        if (p_id) {
          ancestry_ids.push(p_id)
          loopCheck(data_stash.find(d => d.id === p_id))
        }
      })
    }
  }

  function getProgeny(datum, data_stash) {
    const progeny_ids = []
    loopCheck(datum)
    return progeny_ids

    function loopCheck(d) {
      const children = d.rels.children ? [...d.rels.children] : []
      children.forEach(c_id => {
        progeny_ids.push(c_id)
        loopCheck(data_stash.find(d => d.id === c_id))
      })
    }
  }
}