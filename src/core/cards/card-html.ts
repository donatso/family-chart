import * as d3 from "d3"
import cardHtmlRenderer from "../../renderers/card-html"
import {processCardDisplay} from "./utils"
import pathToMain from "../../layout/path-to-main"
import { Store } from "../../types/store"
import { Datum } from "../../types/data"
import { TreeDatum } from "../../types/treeData"
import { Link } from "../../layout/create-links"
import { CardHtmlSelection, LinkSelection } from "../../types/view"

export default function CardHtmlWrapper(cont: HTMLElement, store: Store) { return new CardHtml(cont, store) }

/**
 * CardHtml class - Handles HTML-based card rendering and customization for family tree nodes.
 * 
 * @example
 * ```typescript
 * import * as f3 from 'family-chart'
 * const f3Chart = f3.createChart('#FamilyChart', data)
 * const f3Card = f3Chart.setCardHtml()  // returns a CardHtml instance
 *   .setCardDisplay([["first name","last name"],["birthday"]]);
 * ```
 */
export class CardHtml {
  cont: HTMLElement
  svg: SVGElement
  store: Store
  card_display: any
  cardImageField: string
  onCardClick: any
  style: 'default' | 'imageCircleRect' | 'imageCircle' | 'imageRect' | 'rect'
  mini_tree: boolean
  onCardUpdate: any
  card_dim: { [key: string]: number | boolean }
  cardInnerHtmlCreator: undefined | ((d:TreeDatum) => string)
  defaultPersonIcon: undefined | ((d:TreeDatum) => string)
  onCardMouseenter: undefined | ((e:Event, d:TreeDatum) => void)
  onCardMouseleave: undefined | ((e:Event, d:TreeDatum) => void)
  to_transition: Datum['id'] | undefined | false

  constructor(cont: HTMLElement, store: Store) {
    this.cont = cont
    this.svg = this.cont.querySelector('svg.main_svg')!
    this.store = store
    this.card_display = [(d:Datum) => `${d.data["first name"]} ${d.data["last name"]}`]
    this.cardImageField = 'avatar'
    this.onCardClick = this.onCardClickDefault
    this.style = 'default'
    this.mini_tree = false
    this.card_dim = {}

    return this
  }

  getCard(): (d:TreeDatum) => void {  
    return cardHtmlRenderer({
      store: this.store,
      card_display: this.card_display,
      cardImageField: this.cardImageField,
      defaultPersonIcon: this.defaultPersonIcon,
      onCardClick: this.onCardClick,
      style: this.style,
      mini_tree: this.mini_tree,
      onCardUpdate: this.onCardUpdate,
      card_dim: this.card_dim,
      empty_card_label: this.store.state.single_parent_empty_card_label || '',
      unknown_card_label: this.store.state.unknown_card_label || '',
      cardInnerHtmlCreator: this.cardInnerHtmlCreator,
      duplicate_branch_toggle: this.store.state.duplicate_branch_toggle,
      onCardMouseenter: this.onCardMouseenter ? this.onCardMouseenter.bind(this) : undefined,
      onCardMouseleave: this.onCardMouseleave ? this.onCardMouseleave.bind(this) : undefined
    })
  }

  setCardDisplay(card_display: CardHtml['card_display']) {
    this.card_display = processCardDisplay(card_display)
  
    return this
  }
  
  setCardImageField(cardImageField: CardHtml['cardImageField']) {
    this.cardImageField = cardImageField
    return this
  }
  
  setDefaultPersonIcon(defaultPersonIcon: CardHtml['defaultPersonIcon']) {
    this.defaultPersonIcon = defaultPersonIcon
    return this
  }
  
  setOnCardClick(onCardClick: CardHtml['onCardClick']) {
    this.onCardClick = onCardClick
    return this
  }
  
  onCardClickDefault(e:MouseEvent, d:TreeDatum) {
    this.store.updateMainId(d.data.id)
    this.store.updateTree({})
  }
  
  setStyle(style: CardHtml['style']) {
    this.style = style
    return this
  }
  
  setMiniTree(mini_tree: CardHtml['mini_tree']) {
    this.mini_tree = mini_tree
  
    return this
  }
  
  setOnCardUpdate(onCardUpdate: CardHtml['onCardUpdate']) {
    this.onCardUpdate = onCardUpdate
    return this
  }
  
  setCardDim(card_dim: CardHtml['card_dim']) {
    if (typeof card_dim !== 'object') {
      console.error('card_dim must be an object')
      return this
    }
    for (let key in card_dim) {
      const val = card_dim[key]
      if (typeof val !== 'number' && typeof val !== 'boolean') {
        console.error(`card_dim.${key} must be a number or boolean`)
        return this
      }
      if (key === 'width') key = 'w'
      if (key === 'height') key = 'h'
      if (key === 'img_width') key = 'img_w'
      if (key === 'img_height') key = 'img_h'
      if (key === 'img_x') key = 'img_x'
      if (key === 'img_y') key = 'img_y'
      this.card_dim[key] = val
    }
  
    return this
  }
  
  resetCardDim() {
    this.card_dim = {}
    return this
  }
  
  setCardInnerHtmlCreator(cardInnerHtmlCreator: CardHtml['cardInnerHtmlCreator']) {
    this.cardInnerHtmlCreator = cardInnerHtmlCreator
  
    return this
  }

  setOnHoverPathToMain() {
    this.onCardMouseenter = this.onEnterPathToMain.bind(this)
    this.onCardMouseleave = this.onLeavePathToMain.bind(this)
    return this
  }
  
  unsetOnHoverPathToMain() {
    this.onCardMouseenter = undefined
    this.onCardMouseleave = undefined
    return this
  }
  
  onEnterPathToMain(e:Event, datum:TreeDatum) {
    this.to_transition = datum.data.id
    const main_datum = this.store.getTreeMainDatum()
    const cards: CardHtmlSelection = d3.select(this.cont).select('div.cards_view').selectAll('.card_cont')
    const links: LinkSelection = d3.select(this.cont).select('svg.main_svg .links_view').selectAll('.link')
    const {cards_node_to_main, links_node_to_main} = pathToMain(cards, links, datum, main_datum)
    cards_node_to_main.forEach(d => {
      const delay = Math.abs(datum.depth - d.card.depth) * 200
      d3.select(d.node.querySelector('div.card-inner'))
        .transition().duration(0).delay(delay)
        .on('end', () => this.to_transition === datum.data.id && d3.select(d.node.querySelector('div.card-inner')).classed('f3-path-to-main', true))
    })
    links_node_to_main.forEach(d => {
      const delay = Math.abs(datum.depth - d.link.depth) * 200
      d3.select(d.node)
        .transition().duration(0).delay(delay)
        .on('end', () => this.to_transition === datum.data.id && d3.select(d.node).classed('f3-path-to-main', true))
    })
  
    return this
  }
  
  onLeavePathToMain(e:Event, d:TreeDatum) {
    this.to_transition = false
    d3.select(this.cont).select('div.cards_view').selectAll('div.card-inner').classed('f3-path-to-main', false)
    d3.select(this.cont).select('svg.main_svg .links_view').selectAll('.link').classed('f3-path-to-main', false)
  
    return this
  }

}
