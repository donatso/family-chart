import f3 from '../../src/index.js'

fetch("./data.json").then(r => r.json()).then(data => {
  const card_dim = {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}

  const store = f3.createStore({
      data,
      cont: document.querySelector("#chart"),
      card_display: [d => d.data.label || '', d => d.data.desc || ''],
      mini_tree: true,
      hide_rels: true,
      node_separation: 250,
      level_separation: 150,
      custom_elements: [{el: customAddBtn(card_dim), lis: customAddBtnListener, query: ".customAddBtn"}],
      card_dim
    }),
    view = f3.d3AnimationView(store)

  store.setOnUpdate(props => view.update(props || {}))
  store.update.tree()
})

function customAddBtn(card_dim) {
  return (`
    <g class="customAddBtn" style="cursor: pointer">
      <g transform="translate(${card_dim.w-12},${card_dim.h-12})scale(.08)">
        <circle r="100" fill="#fff" />
        <g transform="translate(-50,-45)">
          <line
            x1="10" x2="90" y1="50" y2="50"
            stroke="currentColor" stroke-width="20" stroke-linecap="round"
          />
          <line
            x1="50" x2="50" y1="10" y2="90"
            stroke="currentColor" stroke-width="20" stroke-linecap="round"
          />
        </g>
      </g>
    </g>
  `)
}

function customAddBtnListener(store, props) {
  console.log(props.card)
  console.log(props.d)
}

