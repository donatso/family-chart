import f3 from "./index.js"
import editTree from "./CreateTree/editTree.js"
import type createStore from "./createStore.js"

export default function(cont,data) { return new CreateChart(cont,data) }
class CreateChart{
  cont: HTMLElement | SVGElement | null
  store: ReturnType<typeof createStore> | null
  svg: SVGElement | null | undefined
  getCard:(() => unknown) | null
  node_separation:unknown
  level_separation:unknown
  is_horizontal:unknown
  single_parent_empty_card:unknown
  transition_time:unknown
  is_card_html:unknown
  beforeUpdate: ((props: unknown) => void) | null
  afterUpdate:  ((props: unknown) => void) | null
  editTreeInstance: {addRelativeInstance: {is_active: boolean, onCancel: () => void}} | undefined
  constructor(cont, data){
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



init(cont, data) {
  this.cont = cont = setCont(cont)
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
    f3.view(this.store?.getTree(), this.svg, this.getCard?.(), props || {})
    if (this.afterUpdate) this.afterUpdate(props)
  })
}

updateTree(props = {initial: false}) {
  this.store?.updateTree(props)

  return this
}

updateData(data) {
  this.store?.updateData(data)

  return this
}

setCardYSpacing(card_y_spacing) {
  if (typeof card_y_spacing !== 'number') {
    console.error('card_y_spacing must be a number')
    return this
  }
  this.level_separation = card_y_spacing
  this.store!.state.level_separation = card_y_spacing
  
  

  return this
}

setCardXSpacing(card_x_spacing) {
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

setSingleParentEmptyCard(single_parent_empty_card, {label='Unknown'} = {}) {
  this.single_parent_empty_card = single_parent_empty_card
  this.store!.state.single_parent_empty_card = single_parent_empty_card
  this.store!.state.single_parent_empty_card_label = label
  if (this.editTreeInstance && this.editTreeInstance.addRelativeInstance.is_active) this.editTreeInstance.addRelativeInstance.onCancel()
  f3.handlers.removeToAddFromData(this.store!.getData() || [])

  return this
}


setCard(Card) {
  this.is_card_html = Card.is_html

  if (this.is_card_html) {
    (this.svg?.querySelector('.cards_view') as HTMLElement).innerHTML = '';
    (this.cont?.querySelector('#htmlSvg') as HTMLElement).style.display = 'block'
  } else {
    (this.cont?.querySelector('#htmlSvg .cards_view')as HTMLElement).innerHTML = '';
    (this.cont?.querySelector('#htmlSvg') as HTMLElement).style.display = 'none'
  }

  const card = Card(this.cont, this.store)
  this.getCard = () => card.getCard()

  return card
}

setTransitionTime(transition_time) {
  this.transition_time = transition_time

  return this
}

editTree() {
  return this.editTreeInstance = editTree(this.cont, this.store)
}

updateMain(d) {
  this.store!.updateMainId(d.data.id)
  this.store!.updateTree({})

  return this
}

updateMainId(id) {
  this.store!.updateMainId(id)

  return this
}

getMainDatum() {
  return this.store!.getMainDatum()
}

getDataJson(fn) {
  const data = this.store!.getData()
  return f3.handlers.cleanupDataJson(JSON.stringify(data))
}


setBeforeUpdate = function(fn) {
  this.beforeUpdate = fn
  return this
}

setAfterUpdate = function(fn) {
  this.afterUpdate = fn
  return this
}
}

function setCont(cont) {
  if (typeof cont === "string") cont = document.querySelector(cont)
  return cont
}