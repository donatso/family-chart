import {toggleAllRels, toggleRels} from "../CalculateTree/CalculateTree.handlers"
import AddRelativeTree from "../AddRelativeTree/AddRelativeTree"
import {deletePerson, moveToAddToAdded} from "./general.js"

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