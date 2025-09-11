import {toggleAllRels, toggleRels} from "../../layout/handlers"
import { Store } from "../../types/store"
import { TreeDatum } from "../../types/treeData"

export function cardChangeMain(store: Store, {d}: {d: TreeDatum}) {
  toggleAllRels(store.getTree()!.data, false)
  store.updateMainId(d.data.id)
  store.updateTree({})
  return true
}

export function cardShowHideRels(store: Store, {d}: {d: TreeDatum}) {
  d.data.hide_rels = !d.data.hide_rels
  toggleRels(d, d.data.hide_rels)
  store.updateTree({})
}