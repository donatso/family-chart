import CalculateTree from "../../src/CalculateTree/CalculateTree.js"
import createSvg from "../../src/view/view.svg.js"
import view from "../../src/view/view.js"

fetch("./data.json").then(r => r.json()).then(data => {
  const svg = createSvg(document.querySelector("#FamilyChart"))

  let tree_data = null;
  let main_id = null;

  update()

  function update() {
    tree_data = CalculateTree({
      data_stash: data,
      node_separation: 250,
      level_separation: 150,
      main_id
    })

    view(tree_data, svg, Card(onCardClick))
  }

  function onCardClick(d) {
    const node = this
    main_id = d.data.id;
    update()
  }

})

function Card(onClick) {
  const card_dim = {w: 220, h: 70}

  return function (d) {
    this.innerHTML = ''
    const g = d3.select(this).append('g')
    .attr('transform', `translate(${[-card_dim.w / 2, -card_dim.h / 2]})`)
    .attr('cursor', 'pointer').on('click', () => onClick.call(this, d))

    createRect()
    createText()

    function createRect() {
      g.append('rect').attr('width', card_dim.w).attr('height', card_dim.h).attr('rx', 3).attr('ry', 3)
        .attr('fill', d.data.data.gender === 'M' ? 'lightblue' : d.data.data.gender === 'F' ? 'pink' : 'lightgray')
    }

    function createText() {
      g.append('text').attr('transform', `translate(${[20, 70/2+5]})`)
        .text(`${d.data.data['first name']} ${d.data.data['last name']}`)
    }
  }
}
