import d3 from "../../d3.js"
import {appendTemplate, CardBodyOutline} from "./Card.templates.js"
import cardElements, {appendElement} from "./Card.elements.js"
import setupCardSvgDefs from "./Card.defs.js"


export function Card(props) {
  props = setupProps(props);
  setupCardSvgDefs(props.svg, props.card_dim)

  return function (d) {
    const gender_class = d.data.data.gender === 'M' ? 'card-male' : d.data.data.gender === 'F' ? 'card-female' : 'card-genderless'
    const card_dim = props.card_dim

    const card = d3.create('svg:g').attr('class', `card ${gender_class}`).attr('transform', `translate(${[-card_dim.w / 2, -card_dim.h / 2]})`)
    card.append('g').attr('class', 'card-inner').attr('clip-path', 'url(#card_clip)')

    this.innerHTML = ''
    this.appendChild(card.node())

    appendTemplate(CardBodyOutline({d,card_dim,is_new:d.data.to_add}).template, card.node(), true)
    appendElement(cardElements.cardBody(d, props), this.querySelector('.card-inner'))

    if (props.img) appendElement(cardElements.cardImage(d, props), this.querySelector('.card'))
    if (props.mini_tree) appendElement(cardElements.miniTree(d, props), this.querySelector('.card'), true)
    if (props.link_break) appendElement(cardElements.lineBreak(d, props), this.querySelector('.card'))

    if (props.cardEditForm) {
      appendElement(cardElements.cardEdit(d, props), this.querySelector('.card-inner'))
      appendElement(cardElements.cardAdd(d, props), this.querySelector('.card-inner'))
    }

    if (props.onCardUpdates) props.onCardUpdates.map(fn => fn.call(this, d))
    if (props.onCardUpdate) props.onCardUpdate.call(this, d)
  }

  function setupProps(props) {
    const default_props = {
      img: true,
      mini_tree: true,
      link_break: false,
      card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    }
    if (!props) props = {}
    for (const k in default_props) {
      if (typeof props[k] === 'undefined') props[k] = default_props[k]
    }
    return props
  }
}