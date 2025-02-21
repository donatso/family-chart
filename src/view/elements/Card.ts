
import {appendTemplate, CardBodyOutline, type CardDisplayFn} from "./Card.templates.ts"
import cardElements, {appendElement} from "./Card.elements.ts"
import setupCardSvgDefs, { type CardDim } from "./Card.defs.js"
import * as d3 from 'd3';
import type { FamilyTreeNode, TreePerson } from "../../types.ts";
import type { TreeStore } from "../../createStore.ts";
import type { CardEditForm } from "../../handlers.ts";

type CardProps = {img: boolean,mini_tree: boolean,link_break:boolean,card_dim: CardDim}
type CardFNProps = Partial<CardProps>  & {svg: SVGElement ,cardEditForm?:CardEditForm, onCardUpdates?:({id?: string, fn: ((d: unknown) => void)}[]) | null, onCardUpdate?: ((d: unknown) => void) | null, store: TreeStore, card_display: CardDisplayFn, onCardClick: () =>void, addRelative: (args: {d: FamilyTreeNode}) => void}
export function Card<TProps extends CardFNProps>(initProps: TProps ) {
  const props = setupProps(initProps);
  setupCardSvgDefs(props.svg, props.card_dim)

  return function (d: FamilyTreeNode) {
    const gender_class = d.data.data.gender === 'M' ? 'card-male' : d.data.data.gender === 'F' ? 'card-female' : 'card-genderless'
    const card_dim = props.card_dim

    const card = d3.create('svg:g').attr('class', `card ${gender_class}`).attr('transform', `translate(${[-card_dim.w / 2, -card_dim.h / 2]})`)
    card.append('g').attr('class', 'card-inner').attr('clip-path', 'url(#card_clip)')

    this.innerHTML = ''
    this.appendChild(card.node())

    appendTemplate(CardBodyOutline({d,card_dim,is_new:d.data.to_add}).template, card.node()!, true)
    appendElement(cardElements.cardBody(d, props), this.querySelector('.card-inner'))

    if (props.img) appendElement(cardElements.cardImage(d, props), this.querySelector('.card'))
    if (props.mini_tree) appendElement(cardElements.miniTree(d, props), this.querySelector('.card'), true)
    if (props.link_break) appendElement(cardElements.lineBreak(d, props), this.querySelector('.card'))

    if (props.cardEditForm) {
      appendElement(cardElements.cardEdit(d, props), this.querySelector('.card-inner'))
      appendElement(cardElements.cardAdd(d, props), this.querySelector('.card-inner'))
    }

    if (props.onCardUpdates) props.onCardUpdates.map(({fn}) => fn.call(this, d))
    if (props.onCardUpdate) props.onCardUpdate.call(this, d)
  }

  function setupProps<T extends Partial<CardProps>>(props: T): (T & CardProps) {
    const default_props = {
      img: true,
      mini_tree: true,
      link_break: false,
      card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    } satisfies CardProps
    for (const _k in default_props) {
      const k = _k  as keyof typeof default_props // TODO not pretty 
      if (typeof props[k] === 'undefined') props[k] = default_props[k] as any
    }
    return props as T & CardProps
  }
}