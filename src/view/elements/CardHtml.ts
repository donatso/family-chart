import * as d3 from 'd3';
import {personSvgIcon, miniTreeSvgIcon, plusSvgIcon} from "./Card.icons.js"
import type { FamilyTreeNode, TreePerson } from '../../types.js';
import type { CardDim } from './Card.defs.js';

export default function CardHtmlElementFunction(props: {card_dim: CardDim, card_display: [(person: TreePerson) => void],style: string,mini_tree: unknown,onCardUpdate: (d: unknown) => void, onCardClick: (e:MouseEvent,d: unknown) => void,onCardMouseleave: (e: MouseEvent,d: unknown) => void, empty_card_label:string, onCardMouseenter: (e: MouseEvent,d: unknown) => void}) {
  const cardInner = props.style === 'default' ? cardInnerDefault 
  : props.style === 'imageCircleRect' ? cardInnerImageCircleRect
  : props.style === 'imageCircle' ? cardInnerImageCircle 
  : props.style === 'imageRect' ? cardInnerImageRect
  : props.style === 'rect' ? cardInnerRect
  : cardInnerDefault

  return function (d: FamilyTreeNode) {
    this.innerHTML = (`
    <div class="card ${getClassList(d).join(' ')}" data-id="${d.data.id}" style="transform: translate(-50%, -50%); pointer-events: auto;">
      ${props.mini_tree ? getMiniTree(d) : ''}
      ${cardInner(d)}
    </div>
    `)
    this.querySelector('.card').addEventListener('click', (e: MouseEvent) => props.onCardClick(e, d))
    if (props.onCardUpdate) props.onCardUpdate.call(this, d)

    if (props.onCardMouseenter) d3.select(this).select('.card').on('mouseenter', e => props.onCardMouseenter(e, d))
    if (props.onCardMouseleave) d3.select(this).select('.card').on('mouseleave', e => props.onCardMouseleave(e, d))
  }

  function getCardInnerImageCircle(d: FamilyTreeNode) {
    return (`
    <div class="card-inner card-image-circle" ${getCardStyle()}>
      ${d.data.data.avatar ? `<img src="${d.data.data["avatar"]}" ${getCardImageStyle()}>` : noImageIcon(d)}
      <div class="card-label">${textDisplay(d)}</div>
    </div>
    `)
  }

  function getCardInnerImageRect(d: FamilyTreeNode) {
    return (`
    <div class="card-inner card-image-rect" ${getCardStyle()}>
      ${d.data.data.avatar ? `<img src="${d.data.data["avatar"]}" ${getCardImageStyle()}>` : noImageIcon(d)}
      <div class="card-label">${textDisplay(d)}</div>
    </div>
    `)
  }

  function getCardInnerRect(d: FamilyTreeNode) {
    return (`
    <div class="card-inner card-rect" ${getCardStyle()}>
      ${textDisplay(d)}
    </div>
    `)
  }

  function textDisplay(d: FamilyTreeNode) {
    if (d.data._new_rel_data) return newRelDataDisplay(d)
    if (d.data.to_add) return `<div>${props.empty_card_label || 'ADD'}</div>`
    return (`
      ${props.card_display.map(display => `<div>${display(d.data)}</div>`).join('')}
    `)
  }

  function newRelDataDisplay(d: FamilyTreeNode) {
    const attr_list: string[] = []
    attr_list.push(`data-rel-type="${d.data._new_rel_data.rel_type}"`)
    if (['son', 'daughter'].includes(d.data._new_rel_data.rel_type)) attr_list.push(`data-other-parent-id="${d.data._new_rel_data.other_parent_id}"`)
    return `<div ${attr_list.join(' ')}>${d.data._new_rel_data.label}</div>`
  }

  function getMiniTree(d: FamilyTreeNode) {
    if (!props.mini_tree) return ''
    if (d.data.to_add) return ''
    if (d.data._new_rel_data) return ''
    if (d.all_rels_displayed) return ''
    return `<div class="mini-tree">${miniTreeSvgIcon()}</div>`
  }

  function cardInnerImageCircleRect(d:FamilyTreeNode) {
    return d.data.data.avatar ? cardInnerImageCircle(d) : cardInnerRect(d)
  }

  function cardInnerDefault(d:FamilyTreeNode) {
    return getCardInnerImageRect(d)
  }

  function cardInnerImageCircle(d: FamilyTreeNode) {
    return getCardInnerImageCircle(d)
  }

  function cardInnerImageRect(d:FamilyTreeNode) {
    return getCardInnerImageRect(d)
  }

  function cardInnerRect(d:FamilyTreeNode) {
    return getCardInnerRect(d)
  }

  function getClassList(d: FamilyTreeNode) {
    const class_list: string[] = []
    if (d.data.data.gender === 'M') class_list.push('card-male')
    else if (d.data.data.gender === 'F') class_list.push('card-female')
    else class_list.push('card-genderless')

    if (d.data.main) class_list.push('card-main')

    if (d.data._new_rel_data) class_list.push('card-new-rel')

    if (d.data.to_add) class_list.push('card-to-add')

    return class_list
  }

  function getCardStyle() {
    let style = 'style="'
    if (props.card_dim.w || props.card_dim.h) {
      style += `width: ${props.card_dim.w}px; min-height: ${props.card_dim.h}px;`
      if (props.card_dim.height_auto) style += 'height: auto;'
      else style += `height: ${props.card_dim.h}px;`
    } else {
      return ''
    }
    style += '"'
    return style
  }

  function getCardImageStyle() {
    let style = 'style="position: relative;'
    if (props.card_dim.img_w || props.card_dim.img_h || props.card_dim.img_x || props.card_dim.img_y) {
      style += `width: ${props.card_dim.img_w}px; height: ${props.card_dim.img_h}px;`
      style += `left: ${props.card_dim.img_x}px; top: ${props.card_dim.img_y}px;`
    } else {
      return ''
    }
    style += '"'
    return style
  }

  function noImageIcon(d: {data: {_new_rel_data: unknown}} ) {
    if (d.data._new_rel_data) return `<div class="person-icon" ${getCardImageStyle()}>${plusSvgIcon()}</div>`
    return `<div class="person-icon" ${getCardImageStyle()}>${personSvgIcon()}</div>`
  }
}
