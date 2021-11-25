import {toggleAllRels} from "../CalculateTree/CalculateTree.handlers.js"
import AddRelativeTree from "./AddRelativeTree.js"

export function AddRelative({store, cont, card_dim, cardEditForm, labels}) {
  return function ({d, scale}) {
    const transition_time = 1000

    if (!scale && window.innerWidth < 650) scale = window.innerWidth / 650
    toggleAllRels(store.getTree().data, false)
    store.update.mainId(d.data.id);
    store.update.tree({tree_position: 'main_to_middle', transition_time, scale})
    const props = {
      store,
      data_stash: store.getData(),
      cont,
      datum: d.data,
      transition_time,
      scale,
      card_dim,
      cardEditForm,
      labels
    }
    AddRelativeTree(props)
  }
}
