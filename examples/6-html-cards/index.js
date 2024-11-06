import f3 from "../../src/index.js"

fetch("./data.json").then(r => r.json()).then(data => {
  let tree, main_id;

  const svg = f3.createSvg(document.querySelector("#FamilyChart"), {onZoom})

  const cont = d3.select(document.querySelector('#FamilyChart'))
  cont.style('position', 'relative').style('overflow', 'hidden')
  const cardHtml = cont.append('div').attr('id', 'htmlSvg')
    .attr('style', 'position: absolute; width: 100%; height: 100%; z-index: 2; top: 0; left: 0')
  cardHtml.append('div').attr('class', 'cards_view').style('transform-origin', '0 0')


  const view_el = d3.select(svg).select('.view')

  function onZoom(e) {
    const t = e.transform

    view_el.style('transform', `translate(${t.x}px, ${t.y}px) scale(${t.k}) `)
    cardHtml.select('.cards_view').style('transform', `translate(${t.x}px, ${t.y}px) scale(${t.k}) `)
  }

  updateTree({initial: true})

  function updateTree(props) {
    tree = f3.CalculateTree({ data, main_id })
    props = Object.assign({}, props || {}, {cardHtml: cardHtml.node()})
    f3.view(tree, svg, Card(tree, svg), props || {})
  }

  function updateMainId(_main_id) {
    main_id = _main_id
  }

  function Card(tree, svg) {
    const card_dim = {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    return function (d) {
      this.innerHTML = ''
      const div = d3.select(this).append('div').style('transform', `translate(${-card_dim.w / 2}px, ${-card_dim.h / 2}px)`)
      const div_inner = div.append('div')
        .attr('style', `width: ${card_dim.w}px; height: ${card_dim.h}px; background-color: gray; color: #fff; border-radius: 3px; cursor: pointer`)
        .on('click', e => onCardClick(e, d))
      div_inner.append('div').attr('style', 'padding: 10px 20px;').html(`${d.data.data["first name"]} ${d.data.data["last name"]}`)
    }

    function onCardClick(e, d) {
      updateMainId(d.data.id)
      updateTree()
    }

  }

})
