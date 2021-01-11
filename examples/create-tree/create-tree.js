import f3 from '../../src/index.js'
import {getLabel} from "../../src/handlers.js"

(async () => {
  const store = f3.createStore({
      data: firstNode(),
      cont: document.querySelector("#chart"),
      card_display: [d => getLabel(d), d => d.data.bd || ''],
      card_edit: cardEditParams(),
      edit: true,
      add: true,
      card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    }),
    view = f3.d3AnimationView(store),
    reactiveTextArea = f3.ReactiveTextarea(data => {store.update.data(data)}, "#textarea", "#update_btn"),
    onUpdate = (props) => {
      view.update(props || {});
      reactiveTextArea.update(store.getData());
    }

  store.setOnUpdate(onUpdate)
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