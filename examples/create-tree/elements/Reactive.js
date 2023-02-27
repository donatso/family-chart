import f3 from "../../../src/index.js";

export default function Reactive(selector, getCode) {
  const element = document.querySelector(selector)

  return {update: updateElement}

  function updateElement(store, card_display) {
    element.innerText = getCode(createTreeJs({data: getCleanedData(store.getData()), card_display}))
  }
}

function getCleanedData(data) {
  let data_no_to_add = JSON.parse(JSON.stringify(data))
  data_no_to_add.forEach(d => d.to_add ? f3.handlers.removeToAdd(d, data_no_to_add) : d)
  data_no_to_add.forEach(d => delete d.main)
  data_no_to_add.forEach(d => delete d.hide_rels)
  return JSON.stringify(data_no_to_add, null, 2)
}

function createTreeJs({data, card_display}) {
  return (`
    const store = f3.createStore({
        data: data(),
        node_separation: 250,
        level_separation: 150
      }),
      view = f3.d3AnimationView({
        store,
        cont: document.querySelector("#FamilyChart")
      }),
      Card = f3.elements.Card({
        store,
        svg: view.svg,
        card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5},
        card_display: [${card_display}],
        mini_tree: true,
        link_break: false
      })
  
    view.setCard(Card)
    store.setOnUpdate(props => view.update(props || {}))
    store.updateTree({initial: true})
    
    function data() {
      return ${data}
    }
  `)
}
