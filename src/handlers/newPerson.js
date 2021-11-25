import {generateUUID, removeToAdd} from "./general.js";

export function handleRelsOfNewDatum({datum, data_stash, rel_type, rel_datum}) {
  if (rel_type === "daughter" || rel_type === "son") addChild(datum)
  else if (rel_type === "father" || rel_type === "mother") addParent(datum)
  else if (rel_type === "spouse") addSpouse(datum)

  function addChild(datum) {
    if (datum.data.other_parent) {
      addChildToSpouseAndParentToChild(datum.data.other_parent)
      delete datum.data.other_parent
    }
    datum.rels[rel_datum.data.gender === 'M' ? 'father' : 'mother'] = rel_datum.id
    if (!rel_datum.rels.children) rel_datum.rels.children = []
    rel_datum.rels.children.push(datum.id)
    return datum

    function addChildToSpouseAndParentToChild(spouse_id) {
      if (spouse_id === "_new") spouse_id = addOtherParent().id;

      const spouse = data_stash.find(d => d.id === spouse_id)
      datum.rels[spouse.data.gender === 'M' ? 'father' : 'mother'] = spouse.id
      if (!spouse.rels.hasOwnProperty('children')) spouse.rels.children = []
      spouse.rels.children.push(datum.id)

      function addOtherParent() {
        const new_spouse = createNewPersonWithGenderFromRel({rel_type: "spouse", rel_datum})
        addSpouse(new_spouse)
        addNewPerson({data_stash, datum: new_spouse})
        return new_spouse
      }
    }
  }

  function addParent(datum) {
    const is_father = datum.data.gender === "M",
      parent_to_add_id = rel_datum.rels[is_father ? 'father' : 'mother'];
    if (parent_to_add_id) removeToAdd(data_stash.find(d => d.id === parent_to_add_id), data_stash)
    addNewParent()

    function addNewParent() {
      rel_datum.rels[is_father ? 'father' : 'mother'] = datum.id
      handleSpouse()
      datum.rels.children = [rel_datum.id]
      return datum

      function handleSpouse() {
        const spouse_id = rel_datum.rels[!is_father ? 'father' : 'mother']
        if (!spouse_id) return
        const spouse = data_stash.find(d => d.id === spouse_id)
        datum.rels.spouses = [spouse_id]
        if (!spouse.rels.spouses) spouse.rels.spouses = []
        spouse.rels.spouses.push(datum.id)
        return spouse
      }
    }
  }

  function addSpouse(datum) {
    removeIfToAdd();
    if (!rel_datum.rels.spouses) rel_datum.rels.spouses = []
    rel_datum.rels.spouses.push(datum.id);
    datum.rels.spouses = [rel_datum.id];

    function removeIfToAdd() {
      if (!rel_datum.rels.spouses) return
      rel_datum.rels.spouses.forEach(spouse_id => {
        const spouse = data_stash.find(d => d.id === spouse_id);
        if (spouse.to_add) removeToAdd(spouse, data_stash)
      })
    }
  }
}

export function createNewPerson({data, rels}) {
  return {id: generateUUID(), data: data || {}, rels: rels || {}}
}

export function createNewPersonWithGenderFromRel({data, rel_type, rel_datum}) {
  const gender = getGenderFromRelative(rel_datum, rel_type)
  data = Object.assign(data || {}, {gender})
  return createNewPerson({data})

  function getGenderFromRelative(rel_datum, rel_type) {
    return (["daughter", "mother"].includes(rel_type) || rel_type === "spouse" && rel_datum.data.gender === "M") ? "F" : "M"
  }
}

export function addNewPerson({data_stash, datum}) {
  data_stash.push(datum)
}

export function createTreeDataWithMainNode({data, version}) {
  return {data: [createNewPerson({data})], version}
}

export function addNewPersonAndHandleRels({datum, data_stash, rel_type, rel_datum}) {
  addNewPerson({data_stash, datum})
  handleRelsOfNewDatum({datum, data_stash, rel_type, rel_datum})
}
