import d3 from "../../d3.js"
import {toggleSvgIconOff, toggleSvgIconOn, miniTreeSvgIcon} from "./Card.icons.js"

export function handleCardDuplicateToggle(node, d, is_horizontal, updateTree) {
  if (!d.hasOwnProperty('_toggle')) return

  const card = node.querySelector('.card-inner')
  const card_width = node.querySelector('.card').offsetWidth
  let toggle_is_off;
  let toggle_id;
  const pos = {}
  if (d.spouse) {
    const spouse = d.spouse
    const parent_id = spouse.data.main ? 'main' : spouse.parent.data.id
    toggle_is_off = spouse.data._tgdp_sp[parent_id][d.data.id]
    pos.top = 60
    pos.left = d.sx-d.x-30+card_width/2
    if (is_horizontal) {
      pos.top = d.sy - d.x + 4
      pos.left = 105
    }
    toggle_id = spouse._toggle_id_sp ? spouse._toggle_id_sp[d.data.id] : -1
  } else {
    const parent_id = d.data.main ? 'main' : d.parent.data.id
    toggle_is_off = d.data._tgdp[parent_id]
    pos.top = -65
    pos.left = -30+card_width/2
    if (is_horizontal) {
      pos.top = 5
      pos.left = -55
    }
    toggle_id = d._toggle_id
  }


  const toggle_div = d3.select(card)
  .append('div')
  .attr('class', 'f3-toggle-div')
  .attr('style', 'cursor: pointer; width: 60px; height: 60px;position: absolute;')
  .style('top', pos.top+'px')
  .style('left', pos.left+'px')

  toggle_div
  .append('div')
  .html(toggle_is_off ? toggleSvgIconOff() : toggleSvgIconOn())
  .select('svg')
  .classed('f3-toggle-icon', true)
  .style('color', toggle_is_off ? '#585656' : '#61bf52')
  .style('padding', '0')
  .on('click', (e) => {
    e.stopPropagation()
    if (d.spouse) {
      const spouse = d.spouse
      const parent_id = spouse.data.main ? 'main' : spouse.parent.data.id
      if (!spouse.data._tgdp_sp[parent_id].hasOwnProperty(d.data.id)) console.error('no toggle', d, spouse)
      spouse.data._tgdp_sp[parent_id][d.data.id] = !spouse.data._tgdp_sp[parent_id][d.data.id]
    } else {
      const parent_id = d.data.main ? 'main' : d.parent.data.id
      d.data._tgdp[parent_id] = !d.data._tgdp[parent_id]
    }

    updateTree()
  })

  d3.select(card)
  .select('.f3-toggle-icon .f3-small-circle')
  .style('fill', '#fff')

  d3.select(card)
  .select('.f3-toggle-icon')
  .append('text')
  .attr('transform', toggle_is_off ? 'translate(10.6, 14.5)' : 'translate(4.1, 14.5)')
  .attr('fill', toggle_is_off ? '#fff' : '#fff')
  .attr('font-size', '7px')
  .text('C'+toggle_id)


  if (toggle_is_off) {
    let transform;
    if (d.is_ancestry) {
      if (is_horizontal) transform = 'translate(5, -30)rotate(-90)'
      else transform = 'translate(0, -10)'
    } else {
      if (is_horizontal) transform = 'translate(11, -22)rotate(90)'
      else transform = 'translate(-7, -32)rotate(180)'
    }
    d3.select(card)
    .select('.f3-toggle-div')
    .insert('div')
    .html(miniTreeSvgIcon())
    .select('svg')
    .attr('style', 'position: absolute; z-index: -1;top: 0;left: 0;border-radius: 0;')
    .style('width', '66px')
    .style('height', '112px')
    .attr('transform', transform)
    .attr('viewBox', '0 0 72 125')
    .select('line')
    .attr('y1', d.is_ancestry ? '62' : '100')
  } 
}