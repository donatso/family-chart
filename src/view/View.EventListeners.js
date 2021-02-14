import {Form} from "./elements/Form.js"
import {moveToAddToAdded, deletePerson} from "../handlers.js"
import AddRelativeTree from "../AddRelativeTree/AddRelativeTree.js"
import {toggleAllRels, toggleRels} from "../CalculateTree/CalculateTree.handlers.js"

export default function ViewAddEventListeners(store) {
  store.state.cont.querySelector(".main_svg").addEventListener("click", e => {
    const node = e.target
    const listeners = [
      {lis: handleCardFamilyTreeClickMaybe, query: ".card_family_tree"},
      {lis: handleCardEditClickMaybe, query: ".card_edit"},
      {lis: handleCardAddRelative, query: ".card_add_relative"},
      {lis: handleCardShowHideRels, query: ".card_break_link"},
      ...(store.state.custom_elements || [])
    ],
      isClicked = (query) => node.closest(query)



    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      if (!isClicked(listener.query)) continue

      const card = node.closest('.card'),
        d_id = card.getAttribute("data-id"),
        d = store.getTree().data.find(d => d.data.id === d_id)
      listener.lis(store, {card, d_id, d})
    }
  })

  function handleCardFamilyTreeClickMaybe(store, {card, d}) {
    toggleAllRels(store.getTree().data, false)
    store.update.mainId(d.data.id)
    store.update.tree({tree_position: 'inherit'})
    return true
  }

  function handleCardEditClickMaybe(store, {card, d}) {
    const datum = d.data,
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

  function handleCardAddRelative(store, {card, d}) {
    const transition_time = 1000

    toggleAllRels(store.getTree().data, false)
    store.update.mainId(d.data.id)
    store.update.tree({tree_position: 'main_to_middle', transition_time})
    AddRelativeTree(store, d.data.id, transition_time)
    return true
  }

  function handleCardShowHideRels(store, {card, d}) {
    d.data.hide_rels = !d.data.hide_rels
    toggleRels(d, d.data.hide_rels)
    store.update.tree({tree_position: 'inherit'})
    return true
  }

}
