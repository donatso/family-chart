import * as d3 from "d3"
import { Datum, Data } from "../../types/data"
import { DatumKinship } from "./kinships-data"

export interface KinshipInfoConfig {
  self_id?: Datum['id']
  getLabel?: (d: DatumKinship) => string
  title?: string
  show_in_law?: boolean
}

export interface Kinships {
  [key: Datum['id']]: string
}

// https://support.ancestry.co.uk/s/article/Understanding-Kinship-Terms
export function calculateKinships(d_id: Datum['id'], data_stash: Data, kinship_info_config: KinshipInfoConfig) {
  const main_datum = data_stash.find(d => d.id === d_id)!
  const kinships: Kinships = {}
  loopCheck(main_datum.id, 'self', 0)
  setupHalfKinships(kinships)
  if (kinship_info_config.show_in_law) setupInLawKinships(kinships, data_stash)
  setupKinshipsGender(kinships)

  return kinships

  function loopCheck(d_id: Datum['id'], kinship: string, depth: number, prev_rel_id: Datum['id'] | undefined = undefined) {
    if (!d_id) return
    // if (kinships[d_id] && kinships[d_id] !== kinship) console.error('kinship mismatch, kinship 1: ', kinships[d_id], 'kinship 2: ', kinship)
    if (kinships[d_id]) return
    if (kinship) kinships[d_id] = kinship
    const datum = data_stash.find(d => d.id === d_id)!
    const rels = datum.rels
    if (kinship === 'self') {
      loopCheck(rels.father!, 'parent', depth - 1, d_id);
      loopCheck(rels.mother!, 'parent', depth - 1, d_id);
      (rels.spouses || []).forEach(id => loopCheck(id, 'spouse', depth));
      (rels.children || []).forEach(id => loopCheck(id, 'child', depth + 1));
    }
    else if (kinship === 'parent') {
      loopCheck(rels.father!, 'grandparent', depth - 1, d_id);
      loopCheck(rels.mother!, 'grandparent', depth - 1, d_id);
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
      loopCheck(rels.father!, 'great-grandparent', depth - 1, d_id);
      loopCheck(rels.mother!, 'great-grandparent', depth - 1, d_id);
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
      loopCheck(rels.father!, getGreatKinship(kinship, depth - 1), depth - 1, d_id);
      loopCheck(rels.mother!, getGreatKinship(kinship, depth - 1), depth - 1, d_id);
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


  function setupHalfKinships(kinships: Kinships) {
    const half_kinships: Datum['id'][] = []
    Object.keys(kinships).forEach(d_id => {
      const kinship = kinships[d_id]
      if (kinship.includes('child')) return
      if (kinship === 'spouse') return
      const same_ancestors = findSameAncestor(main_datum.id, d_id, data_stash)
      if (!same_ancestors) return console.error(`${data_stash.find(d => d.id === d_id)!.data} not found in main_ancestry`)

      if (same_ancestors.is_half_kin) half_kinships.push(d_id)
    })

    half_kinships.forEach(d_id => {
      kinships[d_id] = `Half ${kinships[d_id]}`
    })
  }

  function setupInLawKinships(kinships: Kinships, data_stash: Data) {
    Object.keys(kinships).forEach(d_id => {
      const kinship = kinships[d_id]
      const datum = data_stash.find(d => d.id === d_id)!

      if (kinship === 'spouse') {
        const siblings: Datum['id'][] = [];
        if (datum.rels.mother) (getD(datum.rels.mother)!.rels.children || []).forEach(d_id => siblings.push(d_id))
        if (datum.rels.father) (getD(datum.rels.father)!.rels.children || []).forEach(d_id => siblings.push(d_id))
        siblings.forEach(sibling_id => {if (!kinships[sibling_id]) kinships[sibling_id] = 'sibling-in-law'})  // gender label is added in setupKinshipsGender
      }

      if (kinship === 'sibling') {
        (datum.rels.spouses || []).forEach(spouse_id => {
          if (!kinships[spouse_id]) kinships[spouse_id] = 'sibling-in-law'
        })
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

  function setupKinshipsGender(kinships: Kinships) {
    Object.keys(kinships).forEach(d_id => {
      const kinship = kinships[d_id]
      const datum = data_stash.find(d => d.id === d_id)!
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

  function getD(d_id: Datum['id']) {
    return data_stash.find(d => d.id === d_id)!
  }
}

export function findSameAncestor(main_id: Datum['id'], rel_id: Datum['id'], data_stash: Data) {
  const main_ancestry = getAncestry(main_id)

  let found: Datum['id'] | Datum['id'][] | undefined;
  let is_ancestor;
  let is_half_kin;
  checkIfRel(rel_id)
  checkIfSpouse(rel_id)
  loopCheck(rel_id)
  if (!found) return null
  return {found, is_ancestor, is_half_kin}
  
  function loopCheck(rel_id: Datum['id']) {
    if (found) return
    if (rel_id === main_id) {
      is_ancestor = true
      found = rel_id
      is_half_kin = false
      return
    }
    const d = data_stash.find(d => d.id === rel_id)!
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

  type AncestryTuple = [Datum['id'], Datum['id']]
  function getAncestry(rel_id: Datum['id']) {
    const ancestry: AncestryTuple[] = []
    loopAdd(rel_id)
    return ancestry
  
    function loopAdd(rel_id: Datum['id']) {
      const d = data_stash.find(d => d.id === rel_id)!
      const rels = d.rels
      ancestry.push(getParents(rels))
      if (rels.father) loopAdd(rels.father)
      if (rels.mother) loopAdd(rels.mother)
    }
  }
  
  function getParents(rels: Datum['rels']): AncestryTuple {
    return [rels.father!, rels.mother!]
  }

  function checkIfRel(rel_id: Datum['id']) {
    const d = data_stash.find(d => d.id === rel_id)!
    const found_parent = main_ancestry.find(p => p[0] === d.id || p[1] === d.id)
    if (found_parent) {
      is_ancestor = true
      found = rel_id
      is_half_kin = false
    }
  }

  function checkIfSpouse(rel_id: Datum['id']) {
    const main_datum = data_stash.find(d => d.id === main_id)!
    if ((main_datum.rels.spouses || []).includes(rel_id)) {
      found = [main_id, rel_id]
    }
  }


  function checkIfHalfKin(ancestors1: AncestryTuple, ancestors2: AncestryTuple) {
    return ancestors1[0] !== ancestors2[0] || ancestors1[1] !== ancestors2[1]
  }
}

function getOrdinal(n: number) {
  const s = ['st','nd','rd']
  return s[n-1] ? n+s[n-1] : n+'th'
}

function getGreatCount(depth: number) {
  const depth_abs = Math.abs(depth)
  return depth_abs - 2
}

function getGreatKinship(kinship: string, depth: number) {
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