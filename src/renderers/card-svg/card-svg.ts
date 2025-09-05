import * as d3 from "d3"
import {appendTemplate, CardBodyOutline, CardBodyAddNewRel, CardBody} from "./templates"
import cardElements, {appendElement} from "./elements"
import setupCardSvgDefs from "./defs"
import {plusIcon} from "../icons"
import { TreeDatum } from "../../types/treeData"
import { CardDim } from "./templates"
import { Store } from "../../types/store"

// todo: remove store from props
interface CardSvgProps {
  store: Store
  svg: SVGElement
  card_dim: CardDim
  card_display: (data: TreeDatum['data']) => string
  onCardClick: (e: MouseEvent, d: TreeDatum) => void
  img?: boolean
  mini_tree?: boolean
  link_break?: boolean
  onMiniTreeClick?: (e: MouseEvent, d: TreeDatum) => void
  onLineBreakClick?: (e: MouseEvent, d: TreeDatum) => void
  onCardUpdate?: (d: TreeDatum) => void
}

export default function CardSvg(props: CardSvgProps) {
  props = setupProps(props);
  setupCardSvgDefs(props.svg, props.card_dim)

  return function (this: HTMLElement, d: TreeDatum) {
    const gender_class = d.data.data.gender === 'M' ? 'card-male' : d.data.data.gender === 'F' ? 'card-female' : 'card-genderless'
    const card_dim = props.card_dim

    const card = d3.create('svg:g').attr('class', `card ${gender_class}`).attr('transform', `translate(${[-card_dim.w / 2, -card_dim.h / 2]})`)
    card.append('g').attr('class', 'card-inner').attr('clip-path', 'url(#card_clip)')

    this.innerHTML = ''
    this.appendChild(card.node()!)

    card.on("click", function (e) {
      e.stopPropagation();
      props.onCardClick.call(this, e, d)
    })

    if (d.data._new_rel_data) {
      appendTemplate(CardBodyOutline({d,card_dim,is_new:d.data.to_add}).template, card.node()!, true)
      appendTemplate(CardBodyAddNewRel({d,card_dim,label: d.data._new_rel_data.label}).template, this.querySelector('.card-inner')!, true)
      d3.select(this.querySelector('.card-inner'))
      .append('g')
      .attr('class', 'card-edit-icon')
      .attr('fill', 'currentColor')
      .attr('transform', `translate(-1,2)scale(${card_dim.img_h/22})`)
      .html(plusIcon())
    } else {
      appendTemplate(CardBodyOutline({d,card_dim,is_new:d.data.to_add}).template, card.node()!, true)
      appendTemplate(CardBody({d,card_dim,card_display: props.card_display}).template, this.querySelector('.card-inner')!, false)

      if (props.img) appendElement(cardElements.cardImage(d, props)!, this.querySelector('.card')!)
      if (props.mini_tree) appendElement(cardElements.miniTree(d, props)!, this.querySelector('.card')!, true)
      if (props.link_break) appendElement(cardElements.lineBreak(d, props)!, this.querySelector('.card')!)
    }

    if (props.onCardUpdate) props.onCardUpdate.call(this, d)
  }

  function setupProps(props: CardSvgProps) {
    const default_props = {
      img: true,
      mini_tree: true,
      link_break: false,
      card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    }
    if (!props) props = {} as CardSvgProps
    for (const k in default_props) {
      if (typeof props[k as keyof CardSvgProps] === 'undefined') props[k as keyof CardSvgProps] = default_props[k as keyof typeof default_props] as any
    }
    return props
  }
}

/**
 * @deprecated Use cardSvg instead. This export will be removed in a future version.
 */
export function Card(props: CardSvgProps & {store: Store}) {
  if (props.onCardClick === undefined) props.onCardClick = (e, d) => {
    props.store.updateMainId(d.data.id)
    props.store.updateTree({})
  }
  return CardSvg(props)
}