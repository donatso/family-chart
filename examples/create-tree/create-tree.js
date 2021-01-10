import {getLabel} from "../../src/handlers.js"

(async () => {
  const store = f3.createStore({data: firstNode()}),
    view = f3.d3AnimationView({
      cont: document.querySelector("#chart"),
      card_display: [d => getLabel(d), d => d.data.bd || ''],
      card_edit: cardEditParams(),
      edit: true,
      add: true
    }),
    reactiveTextArea = f3.ReactiveTextarea(data => {store.update.data(data)}, "#textarea", "#update_btn"),
    onUpdate = (props) => {
      view.update({tree: store.state.tree, ...(props || {})});
      reactiveTextArea.update(store.getData());
    }

  store.setOnUpdate(onUpdate)
  view.setEventListeners(store)
  store.update.tree()

})();

function firstNode() {
  return [{id: '0', rels: {}, data: {fn: 'Name', ln: "Surname", bd: 1970, gender: "M"}}]
}

function cardEditParams() {
  return [
    {type: 'text', placeholder: 'first name', key: 'fn'},
    {type: 'text', placeholder: 'last name', key: 'ln'},
    {type: 'text', placeholder: 'birthday', key: 'bd'}
  ]
}