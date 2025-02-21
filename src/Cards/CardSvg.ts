import * as d3 from 'd3';
import f3 from "../index.js"
import {updateCardSvgDefs, type CardDim} from "../view/elements/Card.defs.js"
import {processCardDisplay, type CardDisplayArg, type FamilyMemberFormatter} from "./utils.js"
import type { TreeStore, TreeStoreState } from '../createStore.js';
import type { CardDisplayFn } from '../view/elements/Card.templates.js';
import type { FamilyTreeNode, TreePerson } from '../types.js';

CardSvgWrapper.is_html = false
export default function CardSvgWrapper(cont:Element,store: TreeStore) { return new CardSvg(cont,store) }

class CardSvg{
  cont: Element
  store: TreeStore
  svg: SVGElement |null
  getCard: (() => ((d: FamilyTreeNode) => void )) | null
  card_dim: CardDim
  card_display: CardDisplayFn
  mini_tree:boolean
  link_break:boolean
  onCardClick: (e: MouseEvent,d: FamilyTreeNode) => void
  onCardUpdate: ((d: FamilyTreeNode) => void) | null
  onCardUpdates: ({fn: ((d: FamilyTreeNode) => void), id?:string })[] | null
  


  constructor(cont:Element,store: TreeStore){
  this.cont = cont
  this.store = store
  this.svg = null
  this.getCard = null
  this.card_dim = {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
  this.card_display = [(d: TreePerson)=> `${d.data["first name"]} ${d.data["last name"]}`]
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

  this.getCard = () => {
    const a = f3.elements.Card({
      store: this.store,
      svg: this.svg!,
      card_dim: this.card_dim,
      card_display: this.card_display,
      mini_tree: this.mini_tree,
      link_break: this.link_break,
      onCardClick: this.onCardClick,
      onCardUpdate: this.onCardUpdate,
      onCardUpdates: this.onCardUpdates,
      addRelative: (d: unknown) => {console.debug("add relative not implemented")}
    })
    return a 
  }
}


setCardDisplay(card_display: CardDisplayArg) {
  this.card_display = processCardDisplay(card_display)

  return this
}

setCardDim(card_dim: CardDim) {
  if (typeof card_dim !== 'object') {
    console.error('card_dim must be an object')
    return this
  }
  for (let key in card_dim) {
    const val = card_dim[key as keyof CardDim]
    if (typeof val !== 'number') {
      console.error(`card_dim.${key} must be a number`)
      return this
    }
    if (key === 'width') key = 'w'
    if (key === 'height') key = 'h'
    this.card_dim[key as keyof CardDim] = val
  }

  updateCardSvgDefs(this.svg!, this.card_dim)

  return this
}

setMiniTree(mini_tree: boolean) {
  this.mini_tree = mini_tree

  return this
}

setLinkBreak(link_break:boolean) {
  this.link_break = link_break

  return this
}

setCardTextSvg(cardTextSvg: (d:TreePerson) => string) {
  function onCardUpdate(d: FamilyTreeNode) {
    const card_node = d3.select(this)
    const card_text = card_node.select('.card-text text')
    const card_text_g = (card_text.node() as Element)?.parentElement!
    card_text_g.innerHTML = cardTextSvg(d.data)
  }
  if (!this.onCardUpdates) this.onCardUpdates = []
  this.onCardUpdates = this.onCardUpdates.filter(fn => fn.id !== 'setCardTextSvg')
  this.onCardUpdates.push({fn: onCardUpdate,id: 'setCardTextSvg'})

  return this
}

onCardClickDefault(e: MouseEvent, d: FamilyTreeNode) {
  this.store.updateMainId(d.data.id)
  this.store.updateTree({})
}

setOnCardClick(onCardClick: () => void) {
  this.onCardClick = onCardClick

  return this
}
}