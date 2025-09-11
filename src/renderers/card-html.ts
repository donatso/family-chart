import * as d3 from "d3"
import {personSvgIcon, miniTreeSvgIcon, plusSvgIcon} from "./icons"
import {handleCardDuplicateToggle} from "../features/duplicates-toggle/duplicates-toggle-renderer"
import { Store } from "../types/store";
import { TreeDatum } from "../types/treeData";
import { CardDim } from "../types/card";

export default function CardHtml(props: {
  style: 'default' | 'imageCircleRect' | 'imageCircle' | 'imageRect' | 'rect';
  cardInnerHtmlCreator?: (d: TreeDatum) => string;
  onCardClick: (e: Event, d: TreeDatum) => void;
  onCardUpdate: (d: TreeDatum) => void;
  onCardMouseenter?: (e: Event, d: TreeDatum) => void;
  onCardMouseleave?: (e: Event, d: TreeDatum) => void;
  mini_tree: boolean;
  card_dim: CardDim;
  defaultPersonIcon?: (d: TreeDatum) => string;
  empty_card_label: string;
  unknown_card_label: string;
  cardImageField: string;
  card_display: ((d: TreeDatum['data']) => string)[];
  duplicate_branch_toggle?: boolean;
  store: Store;
}) {
  const cardInner = props.style === 'default' ? cardInnerDefault 
  : props.style === 'imageCircleRect' ? cardInnerImageCircleRect
  : props.style === 'imageCircle' ? cardInnerImageCircle 
  : props.style === 'imageRect' ? cardInnerImageRect
  : props.style === 'rect' ? cardInnerRect
  : cardInnerDefault

  return function (this: HTMLElement, d: TreeDatum) {
    this.innerHTML = (`
    <div class="card ${getClassList(d).join(' ')}" data-id="${d.tid}" style="transform: translate(-50%, -50%); pointer-events: auto;">
      ${props.mini_tree ? getMiniTree(d) : ''}
      ${(props.cardInnerHtmlCreator && !d.data._new_rel_data) ? props.cardInnerHtmlCreator(d) : cardInner(d)}
    </div>
    `)
    this.querySelector('.card')!.addEventListener('click', (e: Event) => props.onCardClick(e, d))
    if (props.onCardUpdate) props.onCardUpdate.call(this, d)

    if (props.onCardMouseenter) d3.select(this).select('.card').on('mouseenter', e => props.onCardMouseenter!(e, d))
    if (props.onCardMouseleave) d3.select(this).select('.card').on('mouseleave', e => props.onCardMouseleave!(e, d))
    if (d.duplicate) handleCardDuplicateHover(this, d)
    if (props.duplicate_branch_toggle) handleCardDuplicateToggle(this, d, props.store.state.is_horizontal, props.store.updateTree)
    if (location.origin.includes('localhost')) {
      d.__node = this.querySelector('.card') as HTMLElement
      d.__label = d.data.data['first name']
      if (d.data.to_add) {
        const spouse = d.spouse || d.coparent || null
        if (spouse) d3.select(this).select('.card').attr('data-to-add', spouse.data.data['first name'])
      }
    }
  }

  function getCardInnerImageCircle(d: TreeDatum) {
    return (`
    <div class="card-inner card-image-circle" ${getCardStyle()}>
      ${d.data.data[props.cardImageField] ? `<img src="${d.data.data[props.cardImageField]}" ${getCardImageStyle()}>` : noImageIcon(d)}
      <div class="card-label">${textDisplay(d)}</div>
      ${d.duplicate ? getCardDuplicateTag(d) : ''}
    </div>
    `)
  }

  function getCardInnerImageRect(d: TreeDatum) {
    return (`
    <div class="card-inner card-image-rect" ${getCardStyle()}>
      ${d.data.data[props.cardImageField] ? `<img src="${d.data.data[props.cardImageField]}" ${getCardImageStyle()}>` : noImageIcon(d)}
      <div class="card-label">${textDisplay(d)}</div>
      ${d.duplicate ? getCardDuplicateTag(d) : ''}
    </div>
    `)
  }

  function getCardInnerRect(d: TreeDatum) {
    return (`
    <div class="card-inner card-rect" ${getCardStyle()}>
      ${textDisplay(d)}
      ${d.duplicate ? getCardDuplicateTag(d) : ''}
    </div>
    `)
  }

  function textDisplay(d: TreeDatum) {
    if (d.data._new_rel_data) return newRelDataDisplay(d)
    if (d.data.to_add) return `<div>${props.empty_card_label || 'ADD'}</div>`
    if (d.data.unknown) return `<div>${props.unknown_card_label || 'UNKNOWN'}</div>`
    return (`
      ${props.card_display.map(display => `<div>${display(d.data)}</div>`).join('')}
    `)
  }

  function newRelDataDisplay(d: TreeDatum) {
    const attr_list = []
    attr_list.push(`data-rel-type="${d.data._new_rel_data.rel_type}"`)
    if (['son', 'daughter'].includes(d.data._new_rel_data.rel_type)) attr_list.push(`data-other-parent-id="${d.data._new_rel_data.other_parent_id}"`)
    return `<div ${attr_list.join(' ')}>${d.data._new_rel_data.label}</div>`
  }

  function getMiniTree(d: TreeDatum) {
    if (!props.mini_tree) return ''
    if (d.data.to_add) return ''
    if (d.data._new_rel_data) return ''
    if (d.all_rels_displayed) return ''
    return `<div class="mini-tree">${miniTreeSvgIcon()}</div>`
  }

  function cardInnerImageCircleRect(d: TreeDatum) {
    return d.data.data[props.cardImageField] ? cardInnerImageCircle(d) : cardInnerRect(d)
  }

  function cardInnerDefault(d: TreeDatum) {
    return getCardInnerImageRect(d)
  }

  function cardInnerImageCircle(d: TreeDatum) {
    return getCardInnerImageCircle(d)
  }

  function cardInnerImageRect(d: TreeDatum) {
    return getCardInnerImageRect(d)
  }

  function cardInnerRect(d: TreeDatum) {
    return getCardInnerRect(d)
  }

  function getClassList(d: TreeDatum) {
    const class_list = []
    if (d.data.data.gender === 'M') class_list.push('card-male')
    else if (d.data.data.gender === 'F') class_list.push('card-female')
    else class_list.push('card-genderless')

    class_list.push(`card-depth-${d.is_ancestry ? -d.depth : d.depth}`)

    if (d.data.main) class_list.push('card-main')

    if (d.data._new_rel_data) class_list.push('card-new-rel')

    if (d.data.to_add) class_list.push('card-to-add')

    if (d.data.unknown) class_list.push('card-unknown')

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

  function noImageIcon(d: TreeDatum) {
    if (d.data._new_rel_data) return `<div class="person-icon" ${getCardImageStyle()}>${plusSvgIcon()}</div>`
    return `<div class="person-icon" ${getCardImageStyle()}>${props.defaultPersonIcon ? props.defaultPersonIcon(d) : personSvgIcon()}</div>`
  }

  function getCardDuplicateTag(d: TreeDatum) {
    return `<div class="f3-card-duplicate-tag">x${d.duplicate}</div>`
  }

  function handleCardDuplicateHover(node: HTMLElement, d: TreeDatum) {
    d3.select(node).on('mouseenter', e => {
      d3.select(node.closest('.cards_view')).selectAll('.card_cont').select('.card').classed('f3-card-duplicate-hover', d0 => (d0 as TreeDatum).data.id === d.data.id)
    })
    d3.select(node).on('mouseleave', e => {
      d3.select(node.closest('.cards_view')).selectAll('.card_cont').select('.card').classed('f3-card-duplicate-hover', false)
    })
  }
}
