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
  return function (d) {
    if (d.data.main) {
      this.innerHTML = ''
      const card = d3.select(this)
      card.append('rect').attr('width', 220).attr('height', 70).attr('fill', '#fff').attr('transform', `translate(${[-220/2, -70/2]})`)
      card.append('text').attr('fill', 'black').text('Different card for main node').attr('transform', `translate(${[220/2-5, -70/2+10]})`).attr('text-anchor', 'end').attr('font-size', 10)
      card.append('text').attr('fill', 'black').text(`${d.data.data['first name']} ${d.data.data['last name']}`).attr('transform', `translate(${[0, 5]})`).attr('text-anchor', 'middle')
      return
    }
    else return f3.elements.Card({
      svg,
      card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5},
      card_display: [d => `${d.data['first name']} ${d.data['last name']}`],

      onCardClick,

      img: true,
      mini_tree: true,
      onMiniTreeClick: onCardClick,
    }).call(this, d)
  }
}
