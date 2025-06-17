import d3 from "../d3.js"

export function sortChildrenWithSpouses(children, datum, data) {
  if (!datum.rels.children) return
  const spouses = datum.rels.spouses || []
  return children.sort((a, b) => {
    const a_p2 = otherParent(a, datum, data) || {}
    const b_p2 = otherParent(b, datum, data) || {}
    const a_i = spouses.indexOf(a_p2.id)
    const b_i = spouses.indexOf(b_p2.id)

    if (datum.data.gender === "M") return a_i - b_i
    else return b_i - a_i
  })
}

export function sortAddNewChildren(children) {
  return children.sort((a, b) => {
    const a_new = a._new_rel_data
    const b_new = b._new_rel_data
    if (a_new && !b_new) return 1
    if (!a_new && b_new) return -1
    return 0
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
    else {d._x = d.psx; d._y = d.psy;}
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

export function setupSiblings({tree, data_stash, node_separation, sortChildrenFunction}) {
  const main = tree.find(d => d.data.main)
  const main_father_id = main.data.rels.father
  const main_mother_id = main.data.rels.mother

  const siblings = findSiblings()
  const siblings_added = addSiblingsToTree()
  positionSiblings()


  function findSiblings() {
    return data_stash.filter(d => {
      if (d.id === main.data.id) return false
      if (main_father_id && d.rels.father === main_father_id) return true
      if (main_mother_id && d.rels.mother === main_mother_id) return true
      return false
    }) 
  }


  function addSiblingsToTree() {
    const siblings_added = []

    for (let i = 0; i < siblings.length; i++) {
      const sib = {data: siblings[i], sibling: true}

      sib.parents = []
      const father = main.parents.find(d => d.data.id === sib.data.rels.father)
      const mother = main.parents.find(d => d.data.id === sib.data.rels.mother)
      if (father) sib.parents.push(father)
      if (mother) sib.parents.push(mother)
      
      sib.x = undefined // to be calculated in positionSiblings
      sib.y = main.y
      sib.depth = main.depth-1

      tree.push(sib)
      siblings_added.push(sib)
    }

    return siblings_added
  }

  function positionSiblings() {
    const sorted_siblings = [main, ...siblings_added]
    if (sortChildrenFunction) sorted_siblings.sort((a, b) => sortChildrenFunction(a.data, b.data))  // first sort by custom function if provided

    sorted_siblings.sort((a, b) => {
      const a_father = main.parents.find(d => d.data.id === a.data.rels.father)
      const a_mother = main.parents.find(d => d.data.id === a.data.rels.mother)
      const b_father = main.parents.find(d => d.data.id === b.data.rels.father)
      const b_mother = main.parents.find(d => d.data.id === b.data.rels.mother)

      // If a doesn't have mother, it should be to the left
      if (!a_mother && b_mother) return -1
      // If b doesn't have mother, it should be to the left
      if (a_mother && !b_mother) return 1
      // If a doesn't have father, it should be to the right
      if (!a_father && b_father) return 1
      // If b doesn't have father, it should be to the right
      if (a_father && !b_father) return -1
      // If both have same parents or both missing same parent, maintain original order
      return 0
    })

    const main_x = main.x
    const spouses_x = (main.spouses || []).map(d => d.x)
    const x_range = d3.extent([main_x, ...spouses_x])

    const main_sorted_index = sorted_siblings.findIndex(d => d.data.id === main.data.id)
    for (let i = 0; i < sorted_siblings.length; i++) {
      if (i === main_sorted_index) continue
      const sib = sorted_siblings[i]
      if (i < main_sorted_index) {
        sib.x = x_range[0] - node_separation*(main_sorted_index - i)
      } else {
        sib.x = x_range[1] + node_separation*(i - main_sorted_index)
      }
    }
  }
}

export function handlePrivateCards({tree, data_stash, private_cards_config}) {
  const private_persons = {}
  const condition = private_cards_config.condition
  if (!condition) return console.error('private_cards_config.condition is not set')
  tree.forEach(d => {
    if (d.data._new_rel_data) return
    const is_private = isPrivate(d.data.id)
    if (is_private) d.is_private = is_private
    return
  })

  function isPrivate(d_id) {
    const parents_and_spouses_checked = []
    let is_private = false
    checkParentsAndSpouses(d_id)
    private_persons[d_id] = is_private
    return is_private

    function checkParentsAndSpouses(d_id) {
      if (is_private) return
      if (private_persons.hasOwnProperty(d_id)) {
        is_private = private_persons[d_id]
        return is_private
      }
      const d = data_stash.find(d0 => d0.id === d_id)
      if (d._new_rel_data) return
      if (condition(d)) {
        is_private = true
        return true
      }

      const rels = d.rels;
      [rels.father, rels.mother, ...(rels.spouses || [])].forEach(d0_id => {
        if (!d0_id) return
        if (parents_and_spouses_checked.includes(d0_id)) return
        parents_and_spouses_checked.push(d0_id)
        checkParentsAndSpouses(d0_id)
      })
    }
  }
}

export function getMaxDepth(d_id, data_stash) {
  const datum = data_stash.find(d => d.id === d_id)
  const root_ancestry = d3.hierarchy(datum, hierarchyGetterParents)
  const root_progeny = d3.hierarchy(datum, hierarchyGetterChildren)

  return {
    ancestry: root_ancestry.height,
    progeny: root_progeny.height
  }


  function hierarchyGetterChildren(d) {
    return [...(d.rels.children || [])]
      .map(id => data_stash.find(d => d.id === id))
      .filter(d => d && !d._new_rel_data && !d.to_add)
  }

  function hierarchyGetterParents(d) {
    return [d.rels.father, d.rels.mother]
      .filter(d => d)
      .map(id => data_stash.find(d => d.id === id))
      .filter(d => d && !d._new_rel_data && !d.to_add)
  }
}