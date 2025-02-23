import f3 from "./index.js"
import editTree, { EditTree } from "./CreateTree/editTree.js"
import type createStore from "./createStore.js"
import type { FamilyTreeNode, TreePerson } from "./types.js"
import type CardHtml from "./Cards/CardHtml.js"
import type CardHTMLWrapper from "./Cards/CardHtml.js"
import CardSvgWrapper from "./Cards/CardSvg.js"
import type { TreeStore, TreeStoreState } from "./createStore.js"

export default function(cont: Element | string,data: TreePerson[]) { return new CreateChart(cont,data) }
class CreateChart{
  cont: Element| null
  store: ReturnType<typeof createStore> | null
  svg: SVGElement | null | undefined
  getCard: (()=> d3.BaseType | string) | null
  node_separation:number
  level_separation:number
  is_horizontal:boolean
  single_parent_empty_card:boolean
  transition_time:number
  is_card_html:boolean
  beforeUpdate: ((props: unknown) => void) | null
  afterUpdate:  ((props: unknown) => void) | null
  editTreeInstance: EditTree | undefined
  constructor(cont: Element | string, data: TreePerson[]){
  this.cont = null
  this.store = null
  this.svg = null
  this.getCard = null
  this.node_separation = 250
  this.level_separation = 150
  this.is_horizontal = false
  this.single_parent_empty_card = true
  this.transition_time = 2000

  this.is_card_html = false

  this.beforeUpdate = null
  this.afterUpdate = null

  this.init(cont, data)

  return this
  }



init(cont: Element | string, data: TreePerson[]) {
  this.cont = cont = setCont(cont)!
  const getSvgView = () => cont.querySelector('svg .view')
  const getHtmlSvg = () => cont.querySelector('#htmlSvg')
  const getHtmlView = () => cont.querySelector('#htmlSvg .cards_view')

  this.svg = f3.createSvg(cont, {onZoom: f3.htmlHandlers.onZoomSetup(getSvgView, getHtmlView)})
  f3.htmlHandlers.createHtmlSvg(cont)

  this.store = f3.createStore({
    data,
    node_separation: this.node_separation,
    level_separation: this.level_separation,
    single_parent_empty_card: this.single_parent_empty_card,
    is_horizontal: this.is_horizontal
  })

  this.setCard(f3.CardSvg) // set default card

  this.store.setOnUpdate(props => {
    if (this.beforeUpdate) this.beforeUpdate(props)
    props = Object.assign({transition_time: this.transition_time}, props || {})
    if (this.is_card_html) props = Object.assign({}, props || {}, {cardHtml: getHtmlSvg()})
    f3.view(this.store?.getTree()!, this.svg!, this.getCard!, props || {})
    if (this.afterUpdate) this.afterUpdate(props)
  })
}

updateTree(props = {initial: false}) {
  this.store?.updateTree(props)

  return this
}

updateData(data: TreePerson[]) {
  this.store?.updateData(data)

  return this
}

setCardYSpacing(card_y_spacing: number) {
  if (typeof card_y_spacing !== 'number') {
    console.error('card_y_spacing must be a number')
    return this
  }
  this.level_separation = card_y_spacing
  this.store!.state.level_separation = card_y_spacing
  
  

  return this
}

setCardXSpacing(card_x_spacing: number) {
  if (typeof card_x_spacing !== 'number') {
    console.error('card_x_spacing must be a number')
    return this
  }
  this.node_separation = card_x_spacing
  this.store!.state.node_separation = card_x_spacing

  

  return this
}

setOrientationVertical() {
  this.is_horizontal = false
  this.store!.state.is_horizontal = false

 

  return this
}

setOrientationHorizontal() {
  this.is_horizontal = true
  if(this.store){
    this.store.state.is_horizontal = true
  }
 

  return this
}

setSingleParentEmptyCard(single_parent_empty_card: boolean, {label='Unknown'} = {}) {
  this.single_parent_empty_card = single_parent_empty_card
  this.store!.state.single_parent_empty_card = single_parent_empty_card
  this.store!.state.single_parent_empty_card_label = label
  if (this.editTreeInstance && this.editTreeInstance.addRelativeInstance?.is_active) this.editTreeInstance.addRelativeInstance?.onCancel?.()
  f3.handlers.removeToAddFromData(this.store!.getData() || [])

  return this
}


setCard(Card: {is_html:boolean} & ((cont: Element,store: TreeStore,) => {getCard: typeof this.getCard })) {
  this.is_card_html = Card.is_html

  if (this.is_card_html) {
    (this.svg?.querySelector('.cards_view') as HTMLElement).innerHTML = '';
    (this.cont?.querySelector('#htmlSvg') as HTMLElement).style.display = 'block'
  } else {
    (this.cont?.querySelector('#htmlSvg .cards_view')as HTMLElement).innerHTML = '';
    (this.cont?.querySelector('#htmlSvg') as HTMLElement).style.display = 'none'
  }

  const card = Card(this.cont!, this.store!)
  this.getCard = () => card.getCard?.()

  return card
}

setTransitionTime(transition_time: number) {
  this.transition_time = transition_time

  return this
}

editTree() {
  return this.editTreeInstance = editTree(this.cont!, this.store!)
}

updateMain(d: {data: {id:string}}) {
  this.store!.updateMainId(d.data.id)
  this.store!.updateTree({})

  return this
}

updateMainId(id: string) {
  this.store!.updateMainId(id)

  return this
}

getMainDatum() {
  return this.store!.getMainDatum()
}

getDataJson(fn: unknown) {
  const data = this.store!.getData()
  return f3.handlers.cleanupDataJson(JSON.stringify(data))
}


setBeforeUpdate(fn: typeof this.beforeUpdate) {
  this.beforeUpdate = fn
  return this
}

setAfterUpdate(fn: typeof this.afterUpdate) {
  this.afterUpdate = fn
  return this
}
}

function setCont(cont: string | Element):Element | null {
  if (typeof cont === "string"){
    return document.querySelector(cont)
  }
  return cont
}