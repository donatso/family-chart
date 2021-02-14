import {toggleAllRels, toggleRels} from "./CalculateTree/CalculateTree.handlers"
import AddRelativeTree from "./AddRelativeTree/AddRelativeTree"

export function moveToAddToAdded(datum, data_stash) {
  delete datum.to_add
  return datum
}

export function removeToAdd(datum, data_stash) {
  deletePerson(datum, data_stash)
  return false
}

export function deletePerson(datum, data_stash) {
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
  data_stash.splice(data_stash.findIndex(d => d === datum), 1)

  if (datum.rels.spouses) {  // if person have spouse holder we delete that as well
    datum.rels.spouses.forEach(sp_id => {
      const spouse = data_stash.find(d => d.id === sp_id)
      if (spouse.to_add) deletePerson(spouse, data_stash)
    })
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
  store.state.cardEditForm({datum, postSubmit, card_edit: store.state.card_edit, card_display: store.state.card_display})
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
