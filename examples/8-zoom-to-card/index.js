import f3 from '../../src/index.js'

fetch("./data-staljin.json").then(r => r.json()).then(data => {
  const store = f3.createStore({
    data,
    node_separation: 250,
    level_separation: 150
  }),
  svg = f3.createSvg(document.querySelector("#FamilyChart")),
  Card = f3.elements.Card({
    store,
    svg,
    card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5},
    card_display: [d => d.data.label || '', d => d.data.desc || ''],
    mini_tree: true,
    link_break: false
  })

  store.setOnUpdate(props => f3.view(store.getTree(), svg, Card, props || {}))
  store.updateTree({initial: true})

  setTimeout(() => {
    const tree = store.getTree();
    const datum = tree.data[Math.floor(tree.data.length*Math.random())]  // random card
    console.log(datum.data.data)
    f3.handlers.cardToMiddle({datum, svg, svg_dim: svg.getBoundingClientRect(),  transition_time: 2000})
  }, 4000)
})