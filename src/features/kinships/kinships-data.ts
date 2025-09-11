import * as d3 from "d3"
import { Datum, Data } from "../../types/data"
import { Kinships, findSameAncestor } from "./calculate-kinships";

export interface DatumKinship extends Datum {
  kinship?: string
}

export function getKinshipsDataStash(main_id: Datum['id'], rel_id: Datum['id'], data_stash: Data, kinships: Kinships) {
  let in_law_id: Datum['id'] | undefined;
  const kinship = kinships[rel_id].toLowerCase()
  if (kinship.includes('in-law')) {
    in_law_id = rel_id
    const datum = data_stash.find(d => d.id === in_law_id)!
    if (kinship.includes('sister') || kinship.includes('brother')) {
      rel_id = main_id
    } else {
      rel_id = datum.rels.spouses?.find(d_id => kinships[d_id] && !kinships[d_id].includes('in-law'))!
    }
  }

  const same_ancestors = findSameAncestor(main_id, rel_id, data_stash)
  if (!same_ancestors) return console.error(`${rel_id} not found in main_ancestry`)

  const same_ancestor_id = same_ancestors.is_ancestor ? same_ancestors.found : same_ancestors.found[0]
  const same_ancestor = data_stash.find(d => d.id === same_ancestor_id)!
  
  const root = d3.hierarchy<Datum>(same_ancestor, hierarchyGetterChildren)
  const same_ancestor_progeny = root.descendants().map(d => d.data.id)
  const main_ancestry = getCleanAncestry(main_id, same_ancestor_progeny)
  const rel_ancestry = getCleanAncestry(rel_id, same_ancestor_progeny)

  loopClean(root)
  const kinship_data_stash = root.descendants().map(d => {
    const datum: DatumKinship = {
      id: d.data.id,
      data: JSON.parse(JSON.stringify(d.data.data)),
      kinship: kinships[d.data.id],
      rels: {
        spouses: [],
        children: []
      }
    }
    if (d.children && d.children.length > 0) datum.rels.children = d.children.map(c => c.data.id)
    return datum
  })

  if (kinship_data_stash.length > 0 && !same_ancestors.is_ancestor && !same_ancestors.is_half_kin) addRootSpouse(kinship_data_stash)
  if (in_law_id) addInLawConnection(kinship_data_stash)

  return kinship_data_stash

  
  function loopClean(tree_datum: d3.HierarchyNode<Datum>) {
    tree_datum.children = (tree_datum.children || []).filter(child => {
      if (main_ancestry.includes(child.data.id)) return true
      if (rel_ancestry.includes(child.data.id)) return true
      return false
    })
    tree_datum.children.forEach(child => loopClean(child))
    if (tree_datum.children.length === 0) delete tree_datum.children
  }

  function hierarchyGetterChildren(d: Datum) {
    const children = [...(d.rels.children || [])].map(id => data_stash.find(d => d.id === id)!).filter(d => d)
    return children
  }

  function getCleanAncestry(d_id: Datum['id'], same_ancestor_progeny: Datum['id'][]) {
    const ancestry = [d_id]
    loopAdd(d_id)
    return ancestry

    function loopAdd(d_id: Datum['id']) {
      const d = data_stash.find(d => d.id === d_id)!
      const rels = d.rels
      if (same_ancestor_progeny.includes(rels.mother!)) {
        ancestry.push(rels.mother!)
        loopAdd(rels.mother!)
      }
      if (same_ancestor_progeny.includes(rels.father!)) {
        ancestry.push(rels.father!)
        loopAdd(rels.father!)
      }
    }
  }

  function addRootSpouse(kinship_data_stash: DatumKinship[]) {
    const datum = kinship_data_stash[0]
    if (!same_ancestors) return console.error(`${rel_id} not found in main_ancestry`)
    const spouse_id = same_ancestor_id === same_ancestors.found[0] ? same_ancestors.found[1] : same_ancestors.found[0]
    datum.rels.spouses = [spouse_id]
    const spouse = data_stash.find(d => d.id === spouse_id)!
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
      const child = data_stash.find(d => d.id === child_id)!
      const kinship_child = kinship_data_stash.find(d => d.id === child_id)!
      kinship_child.rels.father = child.rels.father
      kinship_child.rels.mother = child.rels.mother
    })
  }

  function addInLawConnection(kinship_data_stash: DatumKinship[]) {
    if (kinship.includes('sister') || kinship.includes('brother')) {
      addInLawSibling(kinship_data_stash)
    } else {
      addInLawSpouse(kinship_data_stash)
    }
  }

  function addInLawSpouse(kinship_data_stash: DatumKinship[]) {
    const datum = kinship_data_stash.find(d => d.id === rel_id)!
    const spouse_id = in_law_id!
    datum.rels.spouses = [spouse_id]

    const spouse = data_stash.find(d => d.id === spouse_id)!
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

  function addInLawSibling(kinship_data_stash: DatumKinship[]) {
    const datum = kinship_data_stash.find(d => d.id === rel_id)!
    const in_law_datum = getD(in_law_id!)

    kinship_data_stash.push({
      id: in_law_id!,
      data: JSON.parse(JSON.stringify(in_law_datum.data)),
      kinship: kinships[in_law_id!],
      rels: {
        spouses: [],
        children: []
      }
    })

    const siblings: Datum['id'][] = []
    if (in_law_datum.rels.mother) (getD(in_law_datum.rels.mother)!.rels.children || []).forEach(d_id => siblings.push(d_id))
    if (in_law_datum.rels.father) (getD(in_law_datum.rels.father)!.rels.children || []).forEach(d_id => siblings.push(d_id))
    
    const spouse_id = getD(rel_id)!.rels.spouses?.find(d_id => siblings.includes(d_id))
    datum.rels.spouses = [spouse_id!]
    const spouse = getD(spouse_id!)!
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
      const father = getD(father_id)!
      const father_datum: DatumKinship = {
        id: father.id,
        data: JSON.parse(JSON.stringify(father.data)),
        kinship: 'Father-in-law',
        rels: {
          spouses: [],
          children: [spouse_id!, in_law_id!]
        }
      }
      if (in_law_datum.rels.mother) {father_datum.rels.spouses!.push(in_law_datum.rels.mother)}
      kinship_data_stash.unshift(father_datum);
    }
    if (in_law_datum.rels.mother) {
      const mother_id = in_law_datum.rels.mother
      const mother = getD(mother_id)!
      const mother_datum: DatumKinship = {
        id: mother.id,
        data: JSON.parse(JSON.stringify(mother.data)),
        kinship: 'Mother-in-law',
        rels: {
          spouses: [],
          children: [spouse_id!, in_law_id!]
        }
      }
      if (in_law_datum.rels.father) {mother_datum.rels.spouses!.push(in_law_datum.rels.father)}
      kinship_data_stash.unshift(mother_datum);
    }
  }

  function getD(d_id: Datum['id']) {
    return data_stash.find(d => d.id === d_id)!
  } 
}