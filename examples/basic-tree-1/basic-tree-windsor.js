import f3 from '../../src/index.js'

fetch("./reduc-windsor.json").then(r => r.json()).then(data => {
  const store = f3.createStore({
      data,
      node_separation: 250,
      level_separation: 150
    })

    const view = f3.d3AnimationView({
      store,
      cont: document.querySelector("#FamilyChart")
    })

    const card = f3.elements.Card({
      store,
      svg: view.svg,
      card_dim: {w:220,h:80,text_x:60,text_y:50,img_w:60,img_h:60},
      card_display: [d => d.data.label || '', d => d.data.desc || ''],
      mini_tree: true,
      link_break: false
    })

  view.setCard(card)
  store.setOnUpdate(props => view.update(props || {}))
  store.update.tree({initial: true})
})
