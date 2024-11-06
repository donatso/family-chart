import f3 from '../../src/index.js'

fetch("./data.json").then(r => r.json()).then(data => {
  let tree, main_id;

  const svg = f3.createSvg(document.querySelector("#FamilyChart"))

  updateTree({initial: true})

  function updateTree(props) {
    tree = f3.CalculateTree({ data, main_id })
    f3.view(tree, svg, Card(tree, svg, onCardClick), props || {})
  }

  function updateMainId(_main_id) {
    main_id = _main_id
  }

  function onCardClick(e, d) {
    updateMainId(d.data.id)
    updateTree()
  }

})

function Card(tree, svg, onCardClick) {
  const card_dim = {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
  return function (d) {
    return f3.elements.Card({
      svg,
      card_dim,
      card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`],

      onCardClick,

      img: true,
      mini_tree: true,
      onMiniTreeClick: onCardClick,

      onCardUpdate
    }).call(this, d)
  }

  function onCardUpdate(d) {
    const g = d3.select(this).select('.card-inner').append('g')
    g.on('click', () => {
      console.log('custom element clicked', d)
      // add some action here
    })
    g.html(customAddBtn(card_dim))
  }
}


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
