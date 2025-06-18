import d3 from '../d3.js'

// https://support.ancestry.co.uk/s/article/Understanding-Kinship-Terms
export function calculateRelationships(d_id, data_stash) {
  const main_datum = data_stash.find(d => d.id === d_id)
  const relationships = {}
  loopCheck(main_datum.id, 'self', 0)
  setupHalfRelationships(relationships)
  setupRelationshipsGender(relationships)

  return relationships

  function loopCheck(d_id, kinship, depth, prev_rel_id=undefined) {
    if (!d_id) return
    if (relationships[d_id] && relationships[d_id] !== kinship) console.error('kinship mismatch, kinship 1: ', relationships[d_id], 'kinship 2: ', kinship)
    if (relationships[d_id]) return
    if (kinship) relationships[d_id] = kinship
    const datum = data_stash.find(d => d.id === d_id)
    const rels = datum.rels
    if (kinship === 'self') {
      loopCheck(rels.father, 'parent', depth - 1, d_id);
      loopCheck(rels.mother, 'parent', depth - 1, d_id);
      (rels.spouses || []).forEach(id => loopCheck(id, 'spouse', depth));
      (rels.children || []).forEach(id => loopCheck(id, 'child', depth + 1));
    }
    else if (kinship === 'parent') {
      loopCheck(rels.father, 'grandparent', depth - 1, d_id);
      loopCheck(rels.mother, 'grandparent', depth - 1, d_id);
      (rels.children || []).forEach(id => {
        if (prev_rel_id && prev_rel_id === id) return
        loopCheck(id, 'sibling', depth+1)
      });
    }
    else if (kinship === 'spouse') {
      // nothing
    }
    else if (kinship === 'child') {
      (rels.children || []).forEach(id => loopCheck(id, 'grandchild', depth + 1));
    }
    else if (kinship === 'sibling') {
      (rels.children || []).forEach(id => loopCheck(id, 'nephew', depth + 1));
    }
    else if (kinship === 'grandparent') {
      if (!prev_rel_id) console.error(`${kinship} should have prev_rel_id`)
      loopCheck(rels.father, 'great-grandparent', depth - 1, d_id);
      loopCheck(rels.mother, 'great-grandparent', depth - 1, d_id);
      (rels.children || []).forEach(id => {
        if (prev_rel_id && prev_rel_id === id) return
        loopCheck(id, 'uncle', depth + 1)
      });
    }
    else if (kinship === 'grandchild') {
      (rels.children || []).forEach(id => loopCheck(id, 'great-grandchild', depth + 1));
    }
    else if (kinship.includes('great-grandchild')) {
      (rels.children || []).forEach(id => loopCheck(id, `great-${kinship}`, depth + 1));
    }
    else if (kinship.includes('great-grandparent')) {
      if (!prev_rel_id) console.error(`${kinship} should have prev_rel_id`)
      loopCheck(rels.father, `great-${kinship}`, depth - 1, d_id);
      loopCheck(rels.mother, `great-${kinship}`, depth - 1, d_id);
      (rels.children || []).forEach(id => {
        if (prev_rel_id && prev_rel_id === id) return
        const great_count = getGreatCount(depth + 1)
        if (great_count === 0) loopCheck(id, 'granduncle', depth + 1)
        else if (great_count > 0) loopCheck(id, `${Array(great_count).fill('great').join('-')}-granduncle`, depth + 1)
        else console.error(`${kinship} should have great_count > -1`)
      });
    }
    else if (kinship === 'nephew') {
      (rels.children || []).forEach(id => loopCheck(id, 'grandnephew', depth + 1));
    }
    else if (kinship.includes('grandnephew')) {
      (rels.children || []).forEach(id => loopCheck(id, `great-${kinship}`, depth + 1));
    }
    else if (kinship === 'uncle') {
      (rels.children || []).forEach(id => loopCheck(id, '1st Cousin', depth + 1));
    }
    else if (kinship === 'granduncle') {
      (rels.children || []).forEach(id => loopCheck(id, '1st Cousin 1x removed', depth + 1));
    }
    else if (kinship.includes('great-granduncle')) {
      const child_depth = depth + 1;
      const removed_count = Math.abs(child_depth);
      (rels.children || []).forEach(id => loopCheck(id, `1st Cousin ${removed_count}x removed`, child_depth));
    }
    else if (kinship.slice(4).startsWith('Cousin')) {
      (rels.children || []).forEach(id => {
        const child_depth = depth + 1
        const removed_count = Math.abs(child_depth);
        const cousin_count = +kinship[0]
        if (child_depth === 0) {
          loopCheck(id, `${getOrdinal(cousin_count+1)} Cousin`, child_depth)
        } else if (child_depth < 0) {
          loopCheck(id, `${getOrdinal(cousin_count+1)} Cousin ${removed_count}x removed`, child_depth)
        } else if (child_depth > 0) {
          loopCheck(id, `${getOrdinal(cousin_count)} Cousin ${removed_count}x removed`, child_depth)
        }
      });
    }
    else console.error(`${kinship} not found`)
  }


  function setupHalfRelationships(relationships) {
    const half_relationships = []
    Object.keys(relationships).forEach(d_id => {
      const kinship = relationships[d_id]
      if (kinship.includes('child')) return
      if (kinship === 'spouse') return
      const same_ancestors = findSameAncestor(main_datum.id, d_id, data_stash)
      if (!same_ancestors) return console.error(`${data_stash.find(d => d.id === d_id).data['first name']} not found in main_ancestry`)  // todo: remove this

      if (same_ancestors.is_half_rel) half_relationships.push(d_id)
    })

    half_relationships.forEach(d_id => {
      relationships[d_id] = `Half ${relationships[d_id]}`
    })
  }

  function setupRelationshipsGender(relationships) {
    Object.keys(relationships).forEach(d_id => {
      const kinship = relationships[d_id]
      const datum = data_stash.find(d => d.id === d_id)
      const gender = datum.data.gender
      if (kinship.includes('parent')) {
        const rel_type_general = 'parent'
        const rel_type = gender === 'M' ? 'father' : gender === 'F' ? 'mother' : rel_type_general
        relationships[d_id] = relationships[d_id].replace('parent', rel_type)
      } else if (kinship.includes('sibling')) {
        const rel_type_general = 'sibling'
        const rel_type = gender === 'M' ? 'brother' : gender === 'F' ? 'sister' : rel_type_general
        relationships[d_id] = relationships[d_id].replace('sibling', rel_type)
      } else if (kinship.includes('child')) {
        const rel_type_general = 'child'
        const rel_type = gender === 'M' ? 'son' : gender === 'F' ? 'daughter' : rel_type_general
        relationships[d_id] = relationships[d_id].replace('child', rel_type)
      } else if (kinship.includes('uncle')) {
        const rel_type_general = 'aunt/uncle'
        const rel_type = gender === 'M' ? 'uncle' : gender === 'F' ? 'aunt' : rel_type_general
        relationships[d_id] = relationships[d_id].replace('uncle', rel_type)
      } else if (kinship.includes('nephew')) {
        const rel_type_general = 'neice/nephew'
        const rel_type = gender === 'M' ? 'nephew' : gender === 'F' ? 'niece' : rel_type_general
        relationships[d_id] = relationships[d_id].replace('nephew', rel_type)
      }
    })
  }
}

function findSameAncestor(main_id, rel_id, data_stash) {
  const main_ancestry = getAncestry(main_id)

  let found;
  let is_ancestor;
  let is_half_rel;
  checkIfRel(rel_id)
  loopCheck(rel_id)
  if (!found) return null
  return {found, is_ancestor, is_half_rel}
  
  function loopCheck(rel_id) {
    if (found) return
    const d = data_stash.find(d => d.id === rel_id)
    const rels = d.rels
    const parents = getParents(rels)
    const found_parent = main_ancestry.find(p => (p[0] && parents[0] && p[0] === parents[0]) || (p[1] && parents[1] && p[1] === parents[1]))
    if (found_parent) {
      found = parents.filter((p, i) => p === found_parent[i])
      is_half_rel = checkIfHalfRelationship(parents, found_parent)
      return
    }
    if (rels.father) loopCheck(rels.father)
    if (rels.mother) loopCheck(rels.mother)
  }

  function getAncestry(rel_id) {
    const ancestry = []
    loopAdd(rel_id)
    return ancestry
  
    function loopAdd(rel_id) {
      const d = data_stash.find(d => d.id === rel_id)
      const rels = d.rels
      ancestry.push(getParents(rels))
      if (rels.father) loopAdd(rels.father)
      if (rels.mother) loopAdd(rels.mother)
    }
  }
  
  function getParents(rels) {
    return [rels.father, rels.mother]
  }

  function checkIfRel(rel_id) {
    const d = data_stash.find(d => d.id === rel_id)
    const found_parent = main_ancestry.find(p => p[0] === d.id || p[1] === d.id)
    if (found_parent) {
      is_ancestor = true
      found = rel_id
      is_half_rel = false
    }
  }

  function checkIfHalfRelationship(ancestors1, ancestors2) {
    return ancestors1[0] !== ancestors2[0] || ancestors1[1] !== ancestors2[1]
  }
}

export function getRelationshipsDataStash(main_id, rel_id, data_stash, relationships) {
  const same_ancestors = findSameAncestor(main_id, rel_id, data_stash)
  if (!same_ancestors) return console.error(`${rel_id} not found in main_ancestry`)

  const same_ancestor_id = same_ancestors.is_ancestor ? same_ancestors.found : same_ancestors.found[0]
  const same_ancestor = data_stash.find(d => d.id === same_ancestor_id)
  
  const root = d3.hierarchy(same_ancestor, hierarchyGetterChildren)
  const same_ancestor_progeny = root.descendants().map(d => d.data.id)
  const main_ancestry = getCleanAncestry(main_id, same_ancestor_progeny)
  const rel_ancestry = getCleanAncestry(rel_id, same_ancestor_progeny)

  loopClean(root)
  const kinship_data_stash = root.descendants().map(d => {
    const datum = {
      id: d.data.id,
      data: JSON.parse(JSON.stringify(d.data.data)),
      kinship: relationships[d.data.id],
      rels: {}
    }
    if (d.children && d.children.length > 0) datum.rels.children = d.children.map(c => c.data.id)
    return datum
  })

  if (kinship_data_stash.length > 0 && !same_ancestors.is_ancestor) addRootSpouse(kinship_data_stash)

  return kinship_data_stash

  
  function loopClean(tree_datum) {
    tree_datum.children = (tree_datum.children || []).filter(child => {
      if (main_ancestry.includes(child.data.id)) return true
      if (rel_ancestry.includes(child.data.id)) return true
      return false
    })
    tree_datum.children.forEach(child => loopClean(child))
    if (tree_datum.children.length === 0) delete tree_datum.children
  }

  function hierarchyGetterChildren(d) {
    const children = [...(d.rels.children || [])].map(id => data_stash.find(d => d.id === id))
    return children
  }

  function getCleanAncestry(d_id, same_ancestor_progeny) {
    const ancestry = [d_id]
    loopAdd(d_id)
    return ancestry

    function loopAdd(d_id) {
      const d = data_stash.find(d => d.id === d_id)
      const rels = d.rels
      if (same_ancestor_progeny.includes(rels.mother)) {
        ancestry.push(rels.mother)
        loopAdd(rels.mother)
      }
      if (same_ancestor_progeny.includes(rels.father)) {
        ancestry.push(rels.father)
        loopAdd(rels.father)
      }
    }
  }

  function addRootSpouse(kinship_data_stash) {
    const datum = kinship_data_stash[0]
    const spouse_id = same_ancestor_id === same_ancestors.found[0] ? same_ancestors.found[1] : same_ancestors.found[0]
    datum.rels.spouses = [spouse_id]
    const spouse = data_stash.find(d => d.id === spouse_id)
    const spouse_datum = {
      id: spouse.id,
      data: JSON.parse(JSON.stringify(spouse.data)),
      kinship: relationships[spouse.id],
      rels: {
        spouses: [datum.id],
        children: datum.rels.children
      }
    }
    kinship_data_stash.push(spouse_datum)

    datum.rels.children.forEach(child_id => {
      const child = data_stash.find(d => d.id === child_id)
      const kinship_child = kinship_data_stash.find(d => d.id === child_id)
      kinship_child.rels.father = child.rels.father
      kinship_child.rels.mother = child.rels.mother
    })
  }
    
}

function getOrdinal(n) {
  const s = ['st','nd','rd']
  return s[n-1] ? n+s[n-1] : n+'th'
}

function getGreatCount(depth) {
  const depth_abs = Math.abs(depth)
  return depth_abs - 2
}