import d3 from '../d3.js'

// https://support.ancestry.co.uk/s/article/Understanding-Kinship-Terms
export function calculateKinships(d_id, data_stash, kinship_info_config={}) {
  const main_datum = data_stash.find(d => d.id === d_id)
  const kinships = {}
  loopCheck(main_datum.id, 'self', 0)
  setupHalfKinships(kinships)
  if (kinship_info_config.show_in_law) setupInLawKinships(kinships, data_stash)
  setupKinshipsGender(kinships)

  return kinships

  function loopCheck(d_id, kinship, depth, prev_rel_id=undefined) {
    if (!d_id) return
    if (kinships[d_id] && kinships[d_id] !== kinship) console.error('kinship mismatch, kinship 1: ', kinships[d_id], 'kinship 2: ', kinship)
    if (kinships[d_id]) return
    if (kinship) kinships[d_id] = kinship
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
    else if (kinship.includes('grandchild')) {
      (rels.children || []).forEach(id => loopCheck(id, getGreatKinship(kinship, depth + 1), depth + 1));
    }
    else if (kinship.includes('great-grandparent')) {
      if (!prev_rel_id) console.error(`${kinship} should have prev_rel_id`)
      loopCheck(rels.father, getGreatKinship(kinship, depth - 1), depth - 1, d_id);
      loopCheck(rels.mother, getGreatKinship(kinship, depth - 1), depth - 1, d_id);
      (rels.children || []).forEach(id => {
        if (prev_rel_id && prev_rel_id === id) return
        const great_count = getGreatCount(depth + 1)
        if (great_count === 0) loopCheck(id, 'granduncle', depth + 1)
        else if (great_count > 0) loopCheck(id, getGreatKinship('granduncle', depth + 1), depth + 1)
        else console.error(`${kinship} should have great_count > -1`)
      });
    }
    else if (kinship === 'nephew') {
      (rels.children || []).forEach(id => loopCheck(id, 'grandnephew', depth + 1));
    }
    else if (kinship.includes('grandnephew')) {
      (rels.children || []).forEach(id => loopCheck(id, getGreatKinship(kinship, depth + 1), depth + 1));
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


  function setupHalfKinships(kinships) {
    const half_kinships = []
    Object.keys(kinships).forEach(d_id => {
      const kinship = kinships[d_id]
      if (kinship.includes('child')) return
      if (kinship === 'spouse') return
      const same_ancestors = findSameAncestor(main_datum.id, d_id, data_stash)
      if (!same_ancestors) return console.error(`${data_stash.find(d => d.id === d_id).data} not found in main_ancestry`)

      if (same_ancestors.is_half_kin) half_kinships.push(d_id)
    })

    half_kinships.forEach(d_id => {
      kinships[d_id] = `Half ${kinships[d_id]}`
    })
  }

  function setupInLawKinships(kinships, data_stash) {
    Object.keys(kinships).forEach(d_id => {
      const kinship = kinships[d_id]
      const datum = data_stash.find(d => d.id === d_id)

      if (kinship === 'spouse') {
        const siblings = [];
        if (datum.rels.mother) (getD(datum.rels.mother).rels.children || []).forEach(d_id => siblings.push(d_id))
        if (datum.rels.father) (getD(datum.rels.father).rels.children || []).forEach(d_id => siblings.push(d_id))
        siblings.forEach(sibling_id => {if (!kinships[sibling_id]) kinships[sibling_id] = 'sibling-in-law'})  // gender label is added in setupKinshipsGender
      }

      if (kinship === 'child') {
        (datum.rels.spouses || []).forEach(spouse_id => {if (!kinships[spouse_id]) kinships[spouse_id] = 'child-in-law'})  // gender label is added in setupKinshipsGender
      }

      if (kinship === 'uncle') {
        (datum.rels.spouses || []).forEach(spouse_id => {if (!kinships[spouse_id]) kinships[spouse_id] = 'uncle-in-law'})  // gender label is added in setupKinshipsGender
      }

      if (kinship.includes('Cousin')) {
        (datum.rels.spouses || []).forEach(spouse_id => {if (!kinships[spouse_id]) kinships[spouse_id] = `${kinship} in-law`})  // gender label is added in setupKinshipsGender
      }
    })
  }

  function setupKinshipsGender(kinships) {
    Object.keys(kinships).forEach(d_id => {
      const kinship = kinships[d_id]
      const datum = data_stash.find(d => d.id === d_id)
      const gender = datum.data.gender
      if (kinship.includes('parent')) {
        const rel_type_general = 'parent'
        const rel_type = gender === 'M' ? 'father' : gender === 'F' ? 'mother' : rel_type_general
        kinships[d_id] = kinships[d_id].replace('parent', rel_type)
      } else if (kinship.includes('sibling')) {
        const rel_type_general = 'sibling'
        const rel_type = gender === 'M' ? 'brother' : gender === 'F' ? 'sister' : rel_type_general
        kinships[d_id] = kinships[d_id].replace('sibling', rel_type)
      } else if (kinship.includes('child')) {
        const rel_type_general = 'child'
        const rel_type = gender === 'M' ? 'son' : gender === 'F' ? 'daughter' : rel_type_general
        kinships[d_id] = kinships[d_id].replace('child', rel_type)
      } else if (kinship.includes('uncle')) {
        const rel_type_general = 'aunt/uncle'
        const rel_type = gender === 'M' ? 'uncle' : gender === 'F' ? 'aunt' : rel_type_general
        kinships[d_id] = kinships[d_id].replace('uncle', rel_type)
      } else if (kinship.includes('nephew')) {
        const rel_type_general = 'neice/nephew'
        const rel_type = gender === 'M' ? 'nephew' : gender === 'F' ? 'niece' : rel_type_general
        kinships[d_id] = kinships[d_id].replace('nephew', rel_type)
      }
    })
  }

  function getD(d_id) {
    return data_stash.find(d => d.id === d_id)
  }
}

function findSameAncestor(main_id, rel_id, data_stash) {
  const main_ancestry = getAncestry(main_id)

  let found;
  let is_ancestor;
  let is_half_kin;
  checkIfRel(rel_id)
  checkIfSpouse(rel_id)
  loopCheck(rel_id)
  if (!found) return null
  return {found, is_ancestor, is_half_kin}
  
  function loopCheck(rel_id) {
    if (found) return
    if (rel_id === main_id) {
      is_ancestor = true
      found = rel_id
      is_half_kin = false
      return
    }
    const d = data_stash.find(d => d.id === rel_id)
    const rels = d.rels
    const parents = getParents(rels)
    const found_parent = main_ancestry.find(p => (p[0] && parents[0] && p[0] === parents[0]) || (p[1] && parents[1] && p[1] === parents[1]))
    if (found_parent) {
      found = parents.filter((p, i) => p === found_parent[i])
      is_half_kin = checkIfHalfKin(parents, found_parent)
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
      is_half_kin = false
    }
  }

  function checkIfSpouse(rel_id) {
    const main_datum = data_stash.find(d => d.id === main_id)
    if ((main_datum.rels.spouses || []).includes(rel_id)) {
      found = [main_id, rel_id]
    }
  }


  function checkIfHalfKin(ancestors1, ancestors2) {
    return ancestors1[0] !== ancestors2[0] || ancestors1[1] !== ancestors2[1]
  }
}

export function getKinshipsDataStash(main_id, rel_id, data_stash, kinships) {
  let in_law_id;
  const kinship = kinships[rel_id].toLowerCase()
  if (kinship.includes('in-law')) {
    in_law_id = rel_id
    const datum = data_stash.find(d => d.id === in_law_id)
    if (kinship.includes('sister') || kinship.includes('brother')) {
      rel_id = main_id
    } else {
      rel_id = datum.rels.spouses.find(d_id => kinships[d_id] && !kinships[d_id].includes('in-law'))
    }
  }

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
      kinship: kinships[d.data.id],
      rels: {}
    }
    if (d.children && d.children.length > 0) datum.rels.children = d.children.map(c => c.data.id)
    return datum
  })

  if (kinship_data_stash.length > 0 && !same_ancestors.is_ancestor && !same_ancestors.is_half_kin) addRootSpouse(kinship_data_stash)
  if (in_law_id) addInLawConnection(kinship_data_stash)

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
      kinship: kinships[spouse.id],
      rels: {
        spouses: [datum.id],
        children: datum.rels.children
      }
    }
    kinship_data_stash.push(spouse_datum);

    (datum.rels.children || []).forEach(child_id => {
      const child = data_stash.find(d => d.id === child_id)
      const kinship_child = kinship_data_stash.find(d => d.id === child_id)
      kinship_child.rels.father = child.rels.father
      kinship_child.rels.mother = child.rels.mother
    })
  }

  function addInLawConnection(kinship_data_stash) {
    if (kinship.includes('sister') || kinship.includes('brother')) {
      addInLawSibling(kinship_data_stash)
    } else {
      addInLawSpouse(kinship_data_stash)
    }
  }

  function addInLawSpouse(kinship_data_stash) {
    const datum = kinship_data_stash.find(d => d.id === rel_id)
    const spouse_id = in_law_id
    datum.rels.spouses = [spouse_id]

    const spouse = data_stash.find(d => d.id === spouse_id)
    const spouse_datum = {
      id: spouse.id,
      data: JSON.parse(JSON.stringify(spouse.data)),
      kinship: kinships[spouse.id],
      rels: {
        spouses: [datum.id],
        children: []
      }
    }
    kinship_data_stash.push(spouse_datum);
  }

  function addInLawSibling(kinship_data_stash) {
    const datum = kinship_data_stash.find(d => d.id === rel_id)
    const in_law_datum = getD(in_law_id)

    kinship_data_stash.push({
      id: in_law_id,
      data: JSON.parse(JSON.stringify(in_law_datum.data)),
      kinship: kinships[in_law_id],
      rels: {
        spouses: [],
        children: []
      }
    })

    const siblings = []
    if (in_law_datum.rels.mother) (getD(in_law_datum.rels.mother).rels.children || []).forEach(d_id => siblings.push(d_id))
    if (in_law_datum.rels.father) (getD(in_law_datum.rels.father).rels.children || []).forEach(d_id => siblings.push(d_id))
    
    const spouse_id = getD(rel_id).rels.spouses.find(d_id => siblings.includes(d_id))
    datum.rels.spouses = [spouse_id]
    const spouse = getD(spouse_id)
    const spouse_datum = {
      id: spouse.id,
      data: JSON.parse(JSON.stringify(spouse.data)),
      kinship: kinships[spouse.id],
      rels: {
        spouses: [datum.id],
        children: []
      }
    }
    kinship_data_stash.push(spouse_datum);

    if (in_law_datum.rels.father) {
      const father_id = in_law_datum.rels.father
      const father = getD(father_id)
      const father_datum = {
        id: father.id,
        data: JSON.parse(JSON.stringify(father.data)),
        kinship: 'Father-in-law',
        rels: {
          spouses: [],
          children: [spouse_id, in_law_id]
        }
      }
      if (in_law_datum.rels.mother) {father_datum.rels.spouses.push(in_law_datum.rels.mother)}
      kinship_data_stash.unshift(father_datum);
    }
    if (in_law_datum.rels.mother) {
      const mother_id = in_law_datum.rels.mother
      const mother = getD(mother_id)
      const mother_datum = {
        id: mother.id,
        data: JSON.parse(JSON.stringify(mother.data)),
        kinship: 'Mother-in-law',
        rels: {
          spouses: [],
          children: [spouse_id, in_law_id]
        }
      }
      if (in_law_datum.rels.father) {mother_datum.rels.spouses.push(in_law_datum.rels.father)}
      kinship_data_stash.unshift(mother_datum);
    }
  }

  function getD(d_id) {
    return data_stash.find(d => d.id === d_id)
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

function getGreatKinship(kinship, depth) {
  const great_count = getGreatCount(depth)
  if (kinship.includes('great-')) kinship = kinship.split('great-')[1]
  if (great_count === 1) {
    return `great-${kinship}`
  } else if (great_count > 1) {
    return `${great_count}x-great-${kinship}`;
  } else {
    console.error(`${kinship} should have great_count > 1`)
    return kinship
  }
}