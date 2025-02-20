import * as d3 from 'd3';
import f3 from "../index.js"
import {updateCardSvgDefs} from "../view/elements/Card.defs.js"
import {processCardDisplay, type FamilyMemberFormatter} from "./utils.js"
import type { TreeStore } from '../createStore.js';

CardSvgWrapper.is_html = false
export default function CardSvgWrapper(cont:Element,store) { return new CardSvg(cont,store) }

class CardSvg{
  cont: Element
  store: TreeStore
  svg: unknown |null
  getCard: unknown | null
  card_dim: Record<'w' | 'h' | 'text_x' | 'text_y' | 'img_w' | 'img_h' | 'img_x'| 'img_y',number>
  card_display: FamilyMemberFormatter[]
  mini_tree:boolean
  link_break:boolean
  onCardClick: unknown
  onCardUpdate: unknown | null
  onCardUpdates: {id:string}[] | null
  


  constructor(cont:Element,store: TreeStore){
  this.cont = cont
  this.store = store
  this.svg = null
  this.getCard = null
  this.card_dim = {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
  this.card_display = [d => `${d.data["first name"]} ${d.data["last name"]}`]
  this.mini_tree = true
  this.link_break = false
  this.onCardClick = this.onCardClickDefault
  this.onCardUpdate = null
  this.onCardUpdates = null

  this.init()

  return this
  }


init() {
  this.svg = this.cont.querySelector('svg.main_svg')

  this.getCard = () => f3.elements.Card({
    store: this.store,
    svg: this.svg,
    card_dim: this.card_dim,
    card_display: this.card_display,
    mini_tree: this.mini_tree,
    link_break: this.link_break,
    onCardClick: this.onCardClick,
    onCardUpdate: this.onCardUpdate,
    onCardUpdates: this.onCardUpdates
  })
}


setCardDisplay(card_display) {
  this.card_display = processCardDisplay(card_display)

  return this
}

setCardDim(card_dim) {
  if (typeof card_dim !== 'object') {
    console.error('card_dim must be an object')
    return this
  }
  for (let key in card_dim) {
    const val = card_dim[key]
    if (typeof val !== 'number') {
      console.error(`card_dim.${key} must be a number`)
      return this
    }
    if (key === 'width') key = 'w'
    if (key === 'height') key = 'h'
    this.card_dim[key] = val
  }

  updateCardSvgDefs(this.svg, this.card_dim)

  return this
}

setMiniTree(mini_tree) {
  this.mini_tree = mini_tree

  return this
}

setLinkBreak(link_break) {
  this.link_break = link_break

  return this
}

setCardTextSvg(cardTextSvg) {
  function onCardUpdate(d) {
    const card_node = d3.select(this)
    const card_text = card_node.select('.card-text text')
    const card_text_g = (card_text.node() as Element)?.parentElement!
    card_text_g.innerHTML = cardTextSvg(d.data)
  }
  onCardUpdate.id = 'setCardTextSvg'
  if (!this.onCardUpdates) this.onCardUpdates = []
  this.onCardUpdates = this.onCardUpdates.filter(fn => fn.id !== 'setCardTextSvg')
  this.onCardUpdates.push(onCardUpdate)

  return this
}

onCardClickDefault(e, d) {
  this.store.updateMainId(d.data.id)
  this.store.updateTree({})
}

setOnCardClick(onCardClick) {
  this.onCardClick = onCardClick

  return this
}
}