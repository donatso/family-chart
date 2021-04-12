import {toggleAllRels, toggleRels} from "./CalculateTree/CalculateTree.handlers"
import AddRelativeTree from "./AddRelativeTree/AddRelativeTree"
import d3 from "./d3.js"

export function moveToAddToAdded(datum, data_stash) {
  delete datum.to_add
  return datum
}

export function removeToAdd(datum, data_stash) {
  deletePerson(datum, data_stash)
  return false
}

export function deletePerson(datum, data_stash) {
  if (!checkIfRelativesAreNotSolelyTheirs(datum)) return false
  data_stash.forEach(d => {
    for (let k in d.rels) {
      if (!d.rels.hasOwnProperty(k)) continue
      if (d.rels[k] === datum.id) {
        delete d.rels[k]
      } else if (Array.isArray(d.rels[k]) && d.rels[k].includes(datum.id)) {
        d.rels[k].splice(d.rels[k].findIndex(did => did === datum.id, 1))
      }
    }
  })
  data_stash.splice(data_stash.findIndex(d => d.id === datum.id), 1)
  data_stash.forEach(d => {if (d.to_add) deletePerson(d, data_stash)})  // full update of tree

  return true

  function checkIfRelativesAreNotSolelyTheirs(datum) {
    return true

    if (checkAncestry()) {console.log(`ancestry true, ${datum.id}`); return false}
    else if (checkProgeny()) {console.log(`progeny true, ${datum.id}`); return false}

    return true

    function checkAncestry() {
      return (datum.rels.mother && checkIfRelIsReal(datum.rels.mother)) || (datum.rels.father && checkIfRelIsReal(datum.rels.father))
    }

    function checkProgeny() {
      return (datum.rels.children && datum.rels.children.some(rel_id => (rel_id !== datum.id) && checkIfRelIsReal(rel_id)))
    }

    function checkIfRelIsReal(rel_id) {
      const rel_datum = data_stash.find(d => d.id === rel_id);
      return rel_datum ? !rel_datum.to_add : false
    }

  }
}

export function cardChangeMain(store, {card, d}) {
  toggleAllRels(store.getTree().data, false)
  store.update.mainId(d.data.id)
  store.update.tree({tree_position: 'inherit'})
  return true
}

export function cardEdit(store, {card, d}) {
  const datum = d.data,
    postSubmit = (props) => {
      if (datum.to_add) moveToAddToAdded(datum, store.getData())
      if (props && props.delete) {
        if (datum.main) store.update.mainId(null)
        deletePerson(datum, store.getData())
      }
      store.update.tree()
    }
  store.state.cardEditForm({datum, postSubmit, store})
}

export function cardAddRelative(store, {card, d}) {
  const transition_time = 1000

  toggleAllRels(store.getTree().data, false)
  store.update.mainId(d.data.id)
  store.update.tree({tree_position: 'main_to_middle', transition_time})
  AddRelativeTree(store, d.data.id, transition_time)
}

export function cardShowHideRels(store, {card, d}) {
  d.data.hide_rels = !d.data.hide_rels
  toggleRels(d, d.data.hide_rels)
  store.update.tree({tree_position: 'inherit'})
}

export function manualZoom({amount, svg, transition_time=500}) {
  const zoom = svg.__zoomObj
  d3.select(svg).transition().duration(transition_time || 0).delay(transition_time ? 100 : 0)  // delay 100 because of weird error of undefined something in d3 zoom
    .call(zoom.scaleBy, amount)
}

export function isAllRelativeDisplayed(d, data) {
  const r = d.data.rels,
    all_rels = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(v => v)
  return all_rels.every(rel_id => data.some(d => d.data.id === rel_id))
}
