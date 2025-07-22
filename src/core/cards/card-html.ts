import * as d3 from "d3"
import cardHtmlRenderer from "../../renderers/card-html"
import {processCardDisplay} from "./utils"
import {pathToMain} from "../../layout/create-links"
import { Store } from "../../types/store"
import { Datum } from "../../types/data"

CardHtmlWrapper.is_html = true
export default function CardHtmlWrapper(cont: HTMLElement, store: Store) { return new CardHtml(cont, store) }

class CardHtml {
  cont: HTMLElement
  svg: HTMLElement
  store: Store
  card_display: any
  cardImageField: string
  onCardClick: any
  style: any
  mini_tree: boolean
  onCardUpdate: any
  card_dim: { [key: string]: number | boolean }
  cardInnerHtmlCreator: null | ((d:Datum) => string)
  defaultPersonIcon: null | ((d:Datum) => string)
  onCardMouseenter: null | ((e:MouseEvent, d:Datum) => void)
  onCardMouseleave: null | ((e:MouseEvent, d:Datum) => void)
  to_transition: Datum['id'] | null | false

  static is_html = true

  constructor(cont: HTMLElement, store: Store) {
    this.cont = cont
    this.svg = this.cont.querySelector('svg.main_svg') as HTMLElement
    this.store = store
    this.card_display = [(d:Datum) => `${d.data["first name"]} ${d.data["last name"]}`]
    this.cardImageField = 'avatar'
    this.onCardClick = this.onCardClickDefault
    this.style = 'default'
    this.mini_tree = false
    this.card_dim = {}
    this.cardInnerHtmlCreator = null
    this.defaultPersonIcon = null
    this.onCardMouseenter = null
    this.onCardMouseleave = null
    this.to_transition = null

    return this
  }

  getCard() {  
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
      empty_card_label: this.store.state.single_parent_empty_card_label,
      cardInnerHtmlCreator: this.cardInnerHtmlCreator,
      duplicate_branch_toggle: this.store.state.duplicate_branch_toggle,
      onCardMouseenter: this.onCardMouseenter ? this.onCardMouseenter.bind(this) : null,
      onCardMouseleave: this.onCardMouseleave ? this.onCardMouseleave.bind(this) : null
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
  
  onCardClickDefault(e:MouseEvent, d:Datum) {
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
    this.onCardMouseenter = null
    this.onCardMouseleave = null
    return this
  }
  
  onEnterPathToMain(e:MouseEvent, datum:Datum) {
    this.to_transition = datum.data.id
    const main_datum = this.store.getTreeMainDatum()
    const cards = d3.select(this.cont).select('div.cards_view').selectAll('.card_cont')
    const links = d3.select(this.cont).select('svg.main_svg .links_view').selectAll('.link')
    const [cards_node_to_main, links_node_to_main] = pathToMain(cards, links, datum, main_datum)
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
  
  onLeavePathToMain(e:MouseEvent, d:Datum) {
    this.to_transition = false
    d3.select(this.cont).select('div.cards_view').selectAll('div.card-inner').classed('f3-path-to-main', false)
    d3.select(this.cont).select('svg.main_svg .links_view').selectAll('.link').classed('f3-path-to-main', false)
  
    return this
  }

}
