import {toggleAllRels, toggleRels} from "../CalculateTree/CalculateTree.handlers.ts"
import { TreeStore, type TreeStoreState } from "../createStore.ts"
import {deletePerson, moveToAddToAdded} from "../CreateTree/form.js"
import type { FamilyTreeNode, TreePerson } from "../types.ts"

export function cardChangeMain(store: TreeStore, {d}: {d: FamilyTreeNode}) {
  toggleAllRels(store.getTree()?.data!, false)
  store.updateMainId(d.data.id)
  store.updateTree({tree_position: store.state.tree_fit_on_change})
  return true
}
export type CardEditForm =  (args:{datum: TreePerson,postSubmit: (props?: {delete: boolean}) => void,store: TreeStore}) => {}
export function cardEdit(store: TreeStore, {d, cardEditForm}: {d: {data: TreePerson}, cardEditForm?: CardEditForm}) {
  const datum = d.data,
    postSubmit = (props?: {delete: boolean}) => {
      if (datum.to_add) moveToAddToAdded(datum, store.getData())
      if (props && props.delete) {
        if (datum.main) store.updateMainId(null)
        deletePerson(datum, store.getData())
      }
      store.updateTree()
    }
  cardEditForm?.({datum, postSubmit, store})
}

export function cardShowHideRels(store: TreeStore, {d}: {d: FamilyTreeNode}) {
  d.data.hide_rels = !d.data.hide_rels
  toggleRels(d, d.data.hide_rels)
  store.updateTree({tree_position: store.state.tree_fit_on_change})
}