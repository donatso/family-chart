import {processCardDisplay, type CardDisplayArg, type FamilyMemberFormatter} from "./utils.js"
import {pathToMain, type TreeLink} from "../CalculateTree/createLinks.ts"
import * as d3 from 'd3';
import CardHtmlElementFunction from "../view/elements/CardHtml.js";
import type { FamilyTreeNode, TreePerson } from "../types.ts";
import type { TreeStore } from "../createStore.ts";
import type { CardDim } from "../view/elements/Card.defs.ts";
CardHTMLWrapper.is_html = false
export default function CardHTMLWrapper(cont:Element,store: TreeStore) { return new CardHtml(cont,store) }
export class CardHtml {
    is_html = true
    cont: Element
    svg: SVGElement | undefined 
    store: TreeStore
    getCard: (() => void) | null | undefined
    card_display: FamilyMemberFormatter[]
    onCardClick: (e: PointerEvent,d:{data: {id?: string}}) => void
    style:'default' | string
    mini_tree: boolean
    onCardUpdate:  ((d: FamilyTreeNode) => void) | null
    card_dim: Partial<CardDim>
    onCardMouseenter: ((e: MouseEvent,datum: FamilyTreeNode)=> void) | undefined | null
    onCardMouseleave: ((e: MouseEvent,datum: FamilyTreeNode)=> void) | undefined | null
    to_transition: string | undefined | null

    constructor(cont: Element,store: TreeStore){
      this.cont = cont
      this.store = store
      this.getCard = null
      this.card_display = [(d: TreePerson) => `${d.data["first name"]} ${d.data["last name"]}`] as FamilyMemberFormatter[]
      this.onCardClick = this.onCardClickDefault
      this.style = 'default'
      this.mini_tree = false
      this.onCardUpdate = null
      this.card_dim = {}
    
      this.init()
    }
    init(){
      this.svg = this.cont.querySelector('svg.main_svg') as SVGElement

  this.getCard = () => CardHtmlElementFunction({
    card_display: this.card_display,
    onCardClick: this.onCardClick,
    style: this.style,
    mini_tree: this.mini_tree,
    onCardUpdate: this.onCardUpdate,
    card_dim: this.card_dim as CardDim,
    empty_card_label: this.store.state.single_parent_empty_card_label,
    onCardMouseenter: this.onCardMouseenter ? this.onCardMouseenter.bind(this) : null,
    onCardMouseleave: this.onCardMouseleave ? this.onCardMouseleave.bind(this) : null
  })
    }
    onCardClickDefault(e: PointerEvent,d:{data: {id?: string}} ){
      this.store.updateMainId(d.data.id)
      this.store.updateTree({})
    }
    setCardDisplay(card_display: CardDisplayArg ){
      this.card_display = processCardDisplay(card_display)
      return this
    }
    setOnCardClick(onCardClick: typeof this.onCardClick) {
      this.onCardClick = onCardClick
      return this
    }
    setStyle(style: string) {
      this.style = style
      return this
    }
    setMiniTree(mini_tree: boolean) {
      this.mini_tree = mini_tree
    
      return this
    }
    setOnCardUpdate(onCardUpdate: typeof this.onCardUpdate) {
      this.onCardUpdate = onCardUpdate
      return this
    }
    setCardDim(card_dim: Partial<Record<'width' | 'height' | 'img_width' | 'img_height' | 'img_x' | 'img_y',number>>) {
      if (typeof card_dim !== 'object') {
        console.error('card_dim must be an object')
        return this
      }
      const renameKey = (key:string ) => {
        if (key === 'width') return 'w'
        else if (key === 'height') return 'h'
        else if (key === 'img_width') return 'img_w'
        else if (key === 'img_height') return 'img_h'
        else if (key === 'img_x') return  'img_x'
        else if (key === 'img_y') return 'img_y'
        return key as keyof CardDim
      }
      for (let _key in card_dim) {
        const key = _key as keyof typeof card_dim
        const val = card_dim[key]
        if (typeof val !== 'number' && typeof val !== 'boolean') {
          console.error(`card_dim.${key} must be a number or boolean`)
          return this
        }
        const renamed = renameKey(key)
        this.card_dim[renamed] = val
      }
    
      return this
    }
    resetCardDim() {
      this.card_dim = {}
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
    onEnterPathToMain(e: MouseEvent, datum: FamilyTreeNode) {
      this.to_transition = datum.data.id
      const main_datum = this.store.getTreeMainDatum()
      const cards = d3.select<d3.BaseType,unknown>(this.cont).select<d3.BaseType>('div.cards_view').selectAll<d3.BaseType,FamilyTreeNode>('.card_cont')
      const links = d3.select<d3.BaseType,unknown>(this.cont).select<d3.BaseType>('svg.main_svg .links_view').selectAll<d3.BaseType,TreeLink>('.link')
      const [cards_node_to_main, links_node_to_main] = pathToMain(cards, links, datum, main_datum!)
      cards_node_to_main?.forEach(d => {
        const delay = Math.abs(datum.depth - d.card.depth) * 200
        d3.select((d.node as Element).querySelector('div.card-inner')!)
          .transition().duration(0).delay(delay)
          .on('end', () => this.to_transition === datum.data.id && d3.select((d.node as Element).querySelector('div.card-inner')).classed('f3-path-to-main', true))
      })
      links_node_to_main?.forEach(d => {
        const delay = Math.abs(datum.depth - d.link.depth) * 200
        d3.select(d.node)
          .transition().duration(0).delay(delay)
          .on('end', () => this.to_transition === datum.data.id && d3.select(d.node).classed('f3-path-to-main', true))
      })
    
      return this
    }
    onLeavePathToMain(e: unknown, d: unknown) {
      this.to_transition = null
      d3.select(this.cont).select('div.cards_view').selectAll('div.card-inner').classed('f3-path-to-main', false)
      d3.select(this.cont).select('svg.main_svg .links_view').selectAll('.link').classed('f3-path-to-main', false)
    
      return this
    }
}
