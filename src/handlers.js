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
  if (!checkIfRelativesConnectedWithoutPerson(datum, data_stash)) return {success: false, error: 'checkIfRelativesConnectedWithoutPerson'}
  executeDelete()
  return {success: true};

  function executeDelete() {
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
  }
}

export function checkIfRelativesConnectedWithoutPerson(datum, data_stash) {
  const r = datum.rels,
    r_ids = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(r_id => !!r_id),
    rels_not_to_main = [];

  for (let i = 0; i < r_ids.length; i++) {
    const line = findPersonLineToMain(data_stash.find(d => d.id === r_ids[i]), [datum])
    if (!line) {rels_not_to_main.push(r_ids[i]); break;}
  }
  return rels_not_to_main.length === 0;

  function findPersonLineToMain(datum, without_persons) {
    let line;
    if (isM(datum)) line = [datum]
    checkIfAnyRelIsMain(datum, [datum])
    return line

    function checkIfAnyRelIsMain(d0, history) {
      if (line) return
      history = [...history, d0];
      runAllRels(check);
      if (!line) runAllRels(checkRels);

      function runAllRels(f) {
        const r = d0.rels;
        [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])]
          .filter(d_id => (d_id && ![...without_persons, ...history].find(d => d.id === d_id)))
          .forEach(d_id => f(d_id));
      }

      function check(d_id) {
        if (isM(d_id)) line = history
      }

      function checkRels(d_id) {
        const person = data_stash.find(d => d.id === d_id)
        checkIfAnyRelIsMain(person, history)
      }
    }
  }
  function isM(d0) {return typeof d0 === 'object' ? d0.id === data_stash[0].id : d0 === data_stash[0].id}  // todo: make main more exact
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

export function generateUUID() {
  var d = new Date().getTime();
  var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16;
    if(d > 0){//Use timestamp until depleted
      r = (d + r)%16 | 0;
      d = Math.floor(d/16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r)%16 | 0;
      d2 = Math.floor(d2/16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
