import {toggleAllRels, toggleRels} from "../CalculateTree/CalculateTree.handlers.js"
import AddRelativeTree from "../AddRelativeTree/AddRelativeTree.js"
import {deletePerson, moveToAddToAdded} from "./general.js"

export function cardChangeMain(store, {d}) {
  toggleAllRels(store.getTree().data, false)
  store.update.mainId(d.data.id)
  store.update.tree({tree_position: 'inherit'})
  return true
}

export function cardEdit(store, {d, cardEditForm}) {
  const datum = d.data,
    postSubmit = (props) => {
      if (datum.to_add) moveToAddToAdded(datum, store.getData())
      if (props && props.delete) {
        if (datum.main) store.update.mainId(null)
        deletePerson(datum, store.getData())
      }
      store.update.tree()
    }
  cardEditForm({datum, postSubmit, store})
}

export function cardShowHideRels(store, {d}) {
  d.data.hide_rels = !d.data.hide_rels
  toggleRels(d, d.data.hide_rels)
  store.update.tree({tree_position: 'inherit'})
}