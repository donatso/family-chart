import {moveToAddToAdded, removeToAdd} from "../handlers.js"

export default function NewRelative({datum, data_stash, rel_type}) {
  const new_rel = createNewRel(rel_type);
  return {new_rel, addNewRel}

  function createNewRel(rel_type) {
    const new_rel_gender = (["daughter", "mother"].includes(rel_type) || rel_type === "spouse" && datum.data.gender === "M") ? "F" : "M"
    return {id: Math.random()+"", data: {gender: new_rel_gender}, rels: {}}
  }

  function addNewRel() {
    if (rel_type === "daughter") addChild(new_rel)
    else if (rel_type === "son") addChild(new_rel)
    else if (rel_type === "father") addParent(new_rel)
    else if (rel_type === "mother") addParent(new_rel)
    else if (rel_type === "spouse") addSpouse(new_rel)
  }

  function addChild(new_rel) {
    if (new_rel.data.other_parent) {
      addChildToSpouseAndParentToChild(new_rel.data.other_parent)
      delete new_rel.data.other_parent
    }
    new_rel.rels[datum.data.gender === 'M' ? 'father' : 'mother'] = datum.id
    if (!datum.rels.children) datum.rels.children = []
    datum.rels.children.push(new_rel.id)
    data_stash.push(new_rel)
    return new_rel

    function addChildToSpouseAndParentToChild(spouse_id) {
      if (spouse_id === "_new") spouse_id = addOtherParent().id;

      const spouse = data_stash.find(d => d.id === spouse_id)
      new_rel.rels[spouse.data.gender === 'M' ? 'father' : 'mother'] = spouse.id
      if (!spouse.rels.hasOwnProperty('children')) spouse.rels.children = []
      spouse.rels.children.push(new_rel.id)

      function addOtherParent() {
        const new_spouse = createNewRel("spouse")
        addSpouse(new_spouse)
        return new_spouse
      }
    }
  }

  function addParent(new_rel) {
    const is_father = new_rel.data.gender === "M",
      parent_to_add_id = datum.rels[is_father ? 'father' : 'mother'];
    if (parent_to_add_id) removeToAdd(data_stash.find(d => d.id === parent_to_add_id), data_stash)
    addNewParent()

    function addNewParent() {
      datum.rels[is_father ? 'father' : 'mother'] = new_rel.id
      data_stash.push(new_rel)
      handleSpouse()
      new_rel.rels.children = [datum.id]
      return new_rel

      function handleSpouse() {
        const spouse_id = datum.rels[!is_father ? 'father' : 'mother']
        if (!spouse_id) return
        const spouse = data_stash.find(d => d.id === spouse_id)
        new_rel.rels.spouses = [spouse_id]
        if (!spouse.rels.spouses) spouse.rels.spouses = []
        spouse.rels.spouses.push(new_rel.id)
        return spouse
      }
    }
  }

  function addSpouse(new_rel) {
    removeIfToAdd();
    if (!datum.rels.spouses) datum.rels.spouses = []
    datum.rels.spouses.push(new_rel.id);
    new_rel.rels.spouses = [datum.id];
    data_stash.push(new_rel)

    function removeIfToAdd() {
      if (!datum.rels.spouses) return
      datum.rels.spouses.forEach(spouse_id => {
        const spouse = data_stash.find(d => d.id === spouse_id);
        if (spouse.to_add) removeToAdd(spouse, data_stash)
      })
    }
  }

}
