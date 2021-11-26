export function sortChildrenWithSpouses(data) {
  data.forEach(datum => {
    if (!datum.rels.children) return
    datum.rels.children.sort((a, b) => {
      const a_d = data.find(d => d.id === a),
        b_d = data.find(d => d.id === b),
        a_p2 = otherParent(a_d, datum, data) || {},
        b_p2 = otherParent(b_d, datum, data) || {},
        a_i = datum.rels.spouses.indexOf(a_p2.id),
        b_i = datum.rels.spouses.indexOf(b_p2.id)

      if (datum.data.gender === "M") return a_i - b_i
      else return b_i - a_i
    })
  })
}

function otherParent(d, p1, data) {
  return data.find(d0 => (d0.id !== p1.id) && ((d0.id === d.rels.mother) || (d0.id === d.rels.father)))
}

export function calculateEnterAndExitPositions(d, entering, exiting) {
  d.exiting = exiting
  if (entering) {
    if (d.depth === 0 && !d.spouse) {d._x = d.x; d._y = d.y}
    else if (d.spouse) {d._x = d.spouse.x; d._y = d.spouse.y;}
    else if (d.is_ancestry) {d._x = d.parent.x; d._y = d.parent.y;}
    else {d._x = d.psx; d._y = d.parent.y;}
  } else if (exiting) {
    const x = d.x > 0 ? 1 : -1,
      y = d.y > 0 ? 1 : -1
    {d._x = d.x+400*x; d._y = d.y+400*y;}
  }
}

export function toggleRels(tree_datum, hide_rels) {
  const
    rels = hide_rels ? 'rels' : '_rels',
    rels_ = hide_rels ? '_rels' : 'rels'
  
  if (tree_datum.is_ancestry || tree_datum.data.main) {showHideAncestry('father'); showHideAncestry('mother')}
  else {showHideChildren()}

  function showHideAncestry(rel_type) {
    if (!tree_datum.data[rels] || !tree_datum.data[rels][rel_type]) return
    if (!tree_datum.data[rels_]) tree_datum.data[rels_] = {}
    tree_datum.data[rels_][rel_type] = tree_datum.data[rels][rel_type]
    delete tree_datum.data[rels][rel_type]
  }

  function showHideChildren() {
    if (!tree_datum.data[rels] || !tree_datum.data[rels].children) return
    const
      children = tree_datum.data[rels].children.slice(0),
      spouses = tree_datum.spouse ? [tree_datum.spouse] : tree_datum.spouses || [];

    [tree_datum, ...spouses].forEach(sp => children.forEach(ch_id => {
      if (sp.data[rels].children.includes(ch_id)) {
        if (!sp.data[rels_]) sp.data[rels_] = {}
        if (!sp.data[rels_].children) sp.data[rels_].children = []
        sp.data[rels_].children.push(ch_id)
        sp.data[rels].children.splice(sp.data[rels].children.indexOf(ch_id), 1)
      }
    }))
  }
}

export function toggleAllRels(tree_data, hide_rels) {
  tree_data.forEach(d => {d.data.hide_rels = hide_rels; toggleRels(d, hide_rels)})
}

