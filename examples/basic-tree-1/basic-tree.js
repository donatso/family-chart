import f3 from '../../src/index.js'

fetch("./data.json").then(r => r.json()).then(data => {
  const store = f3.createStore({
      data,
      cont: document.querySelector("#chart"),
      card_display: [d => d.data.label || '', d => d.data.desc || ''],
      mini_tree: true,
      hide_rels: true,
      node_separation: 250,
      level_separation: 150,
      card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    }),
    view = f3.d3AnimationView(store)

  store.setOnUpdate(props => view.update(props || {}))
  store.update.tree()
})
