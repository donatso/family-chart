import * as d3 from "d3"
import cardSvgRenderer from "../../renderers/card-svg/card-svg"
import {updateCardSvgDefs} from "../../renderers/card-svg/defs"
import {processCardDisplay} from "./utils"
import { Store } from "../../types/store"
import { TreeDatum } from "../../types/treeData"
import { CardDim } from "../../renderers/card-svg/templates"

export default function CardSvgWrapper(cont: HTMLElement, store: Store) { return new CardSvg(cont, store) }

export class CardSvg {
  cont: HTMLElement
  store: Store
  svg: SVGElement
  card_dim: CardDim
  card_display: any
  mini_tree: boolean
  link_break: boolean
  onCardClick: (e: MouseEvent, d: TreeDatum) => void
  onCardUpdate: ((d: TreeDatum) => void) | undefined

  constructor(cont: HTMLElement, store: Store) {
    this.cont = cont
    this.store = store
    this.svg = this.cont.querySelector('svg.main_svg')!
    this.card_dim = {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    this.card_display = []
    this.mini_tree = true
    this.link_break = false
    this.onCardClick = this.onCardClickDefault.bind(this)
    
    return this
  }

  getCard(): (d:TreeDatum) => void {
    return cardSvgRenderer({
      store: this.store,
      svg: this.svg,
      card_dim: this.card_dim,
      card_display: this.card_display,
      mini_tree: this.mini_tree,
      link_break: this.link_break,
      onCardClick: this.onCardClick,
      onCardUpdate: this.onCardUpdate
    })
  }

  setCardDisplay(card_display: CardSvg['card_display']) {
    this.card_display = processCardDisplay(card_display)
  
    return this
  }
  
  setCardDim(card_dim: CardSvg['card_dim']) {
    if (typeof card_dim !== 'object') {
      console.error('card_dim must be an object')
      return this
    }
    for (let key in card_dim) {
      const val = card_dim[key as keyof CardSvg['card_dim']]
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
      this.card_dim[key as keyof CardSvg['card_dim']] = val
    }
  
    updateCardSvgDefs(this.svg, this.card_dim)
  
    return this
  }
  
  setOnCardUpdate(onCardUpdate: CardSvg['onCardUpdate']) {
    this.onCardUpdate = onCardUpdate
    return this
  }
  
  setMiniTree(mini_tree: CardSvg['mini_tree']) {
    this.mini_tree = mini_tree
  
    return this
  }
  
  setLinkBreak(link_break: CardSvg['link_break']) {
    this.link_break = link_break
  
    return this
  }
  
  onCardClickDefault(e: MouseEvent, d: TreeDatum) {
    this.store.updateMainId(d.data.id)
    this.store.updateTree({})
  }
  
  setOnCardClick(onCardClick: CardSvg['onCardClick']) {
    this.onCardClick = onCardClick
  
    return this
  }
}