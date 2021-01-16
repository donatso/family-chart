import f3 from '../../src/index.js'
import Edit from './elements/Edit.js'
import ReactiveTextarea from "./elements/ReactiveTextarea.js"
import Display from "./elements/Display.js"

(async () => {
  const store = f3.createStore({
      data: firstNode(),
      cont: document.querySelector("#chart"),
      card_display: cardDisplay(),
      card_edit: cardEditParams(),
      edit: true,
      add: true,
      card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    }),
    view = f3.d3AnimationView(store),
    reactiveTextArea = ReactiveTextarea(data => {store.update.data(data)}, "#textarea", "#update_btn"),
    edit = Edit('#edit_cont', store),
    display = Display('#display_cont', store),
    onUpdate = (props) => {
      view.update(props || {});
      reactiveTextArea.update(store.getData());
    }

  store.setOnUpdate(onUpdate)
  store.update.tree()

})();

function firstNode() {
  return [{id: '0', rels: {}, data: {'first name': 'Name', 'last name': "Surname", 'birthday': 1970, gender: "M"}}]
}

function cardEditParams() {
  return [
    {type: 'text', placeholder: 'first name', key: 'first name'},
    {type: 'text', placeholder: 'last name', key: 'last name'},
    {type: 'text', placeholder: 'birthday', key: 'birthday'},
    {type: 'text', placeholder: 'image', key: 'image'}
  ]
}

function cardDisplay() {
  const d1 = d => d.data['first name'] + " " + d.data['last name'],
    d2 = d => d.data['birthday']
  d1.create_form = "{first name} {last name}"
  d2.create_form = "{birthday}"

  return [
    d1,
    d2
  ]
}