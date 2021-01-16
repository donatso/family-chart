import {Form} from "./elements/Form.js"
import {moveToAddToAdded, deletePerson} from "../handlers.js"
import AddRelativeTree from "../AddRelativeTree/AddRelativeTree.js"
import {toggleAllRels, toggleRels} from "../CalculateTree/CalculateTree.handlers.js"

export default function ViewAddEventListeners(store) {
  store.state.cont.querySelector(".main_svg").addEventListener("click", e => {
    const node = e.target

    handleCardFamilyTreeClickMaybe(node) || handleCardEditClickMaybe(node)
    || handleCardAddRelative(node) || handleCardShowHideRels(node)
  })

  function handleCardFamilyTreeClickMaybe(node) {
    if (!node.closest('.card_family_tree')) return
    const card = node.closest('.card'),
      d_id = card.getAttribute("data-id")

    toggleAllRels(store.getTree().data, false)
    store.update.mainId(d_id)
    store.update.tree({tree_position: 'inherit'})
    return true
  }

  function handleCardEditClickMaybe(node) {
    if (!node.closest('.card_edit')) return
    const card = node.closest('.card'),
      d_id = card.getAttribute("data-id"),
      datum = store.getData().find(d => d.id === d_id),
      postSubmit = (props) => {
        if (datum.to_add) moveToAddToAdded(datum, store.getData())
        if (props && props.delete) {
          if (datum.main) store.update.mainId(null)
          deletePerson(datum, store.getData())
        }
        store.update.tree()
      }
    Form({datum, postSubmit, card_edit: store.state.card_edit, card_display: store.state.card_display})
    return true
  }

  function handleCardAddRelative(node) {
    if (!node.closest('.card_add_relative')) return
    const card = node.closest('.card'),
      d_id = card.getAttribute("data-id"),
      transition_time = 1000

    toggleAllRels(store.getTree().data, false)
    store.update.mainId(d_id)
    store.update.tree({tree_position: 'main_to_middle', transition_time})
    AddRelativeTree(store, d_id, transition_time)
    return true
  }

  function handleCardShowHideRels(node) {
    if (!node.closest('.card_break_link')) return
    const card = node.closest('.card'),
      d_id = card.getAttribute("data-id"),
      tree_datum = store.getTree().data.find(d => d.data.id === d_id)

    tree_datum.data.hide_rels = !tree_datum.data.hide_rels
    toggleRels(tree_datum, tree_datum.data.hide_rels)
    store.update.tree({tree_position: 'inherit'})
    return true
  }

}
