import d3 from "./d3.js"
import f3 from "./index.js"

export default function(...args) { return new CreateChart(...args) }

function CreateChart(cont, data) {
  this.cont = null
  this.store = null
  this.svg = null
  this.getCard = null
  this.node_separation = 250
  this.level_separation = 150
  this.transition_time = 2000

  this.is_card_html = false

  this.init(cont, data)

  return this
}

CreateChart.prototype.init = function(cont, data) {
  this.cont = cont = setCont(cont)
  const getSvgView = () => cont.querySelector('svg .view')
  const getHtmlSvg = () => cont.querySelector('#htmlSvg')
  const getHtmlView = () => cont.querySelector('#htmlSvg .cards_view')

  this.svg = f3.createSvg(cont, {onZoom: f3.htmlHandlers.onZoomSetup(getSvgView, getHtmlView)})
  f3.htmlHandlers.createHtmlSvg(cont)

  this.store = f3.createStore({
    data,
    node_separation: this.node_separation,
    level_separation: this.level_separation
  })

  this.setCard(f3.CardSvg) // set default card

  this.store.setOnUpdate(props => {
    props = Object.assign({}, props || {}, {transition_time: this.transition_time})
    if (this.is_card_html) props = Object.assign({}, props || {}, {cardHtml: getHtmlSvg()})
    f3.view(this.store.getTree(), this.svg, this.getCard(), props || {})
  })
}

CreateChart.prototype.updateTree = function({initial= false} = {}) {
  this.store.updateTree({initial})

  return this
}

CreateChart.prototype.updateData = function(data) {
  this.store.updateData(data)

  return this
}

CreateChart.prototype.setCardYSpacing = function(card_y_spacing) {
  if (typeof card_y_spacing !== 'number') {
    console.error('card_y_spacing must be a number')
    return this
  }
  this.store.state.level_separation = card_y_spacing

  return this
}

CreateChart.prototype.setCardXSpacing = function(card_x_spacing) {
  if (typeof card_x_spacing !== 'number') {
    console.error('card_x_spacing must be a number')
    return this
  }
  this.store.state.node_separation = card_x_spacing

  return this
}

CreateChart.prototype.setCard = function(Card) {
  console.log(Card)
  this.is_card_html = Card.is_html

  if (this.is_card_html) {
    this.svg.querySelector('.cards_view').innerHTML = ''
    this.cont.querySelector('#htmlSvg').style.display = 'block'
  } else {
    this.cont.querySelector('#htmlSvg .cards_view').innerHTML = ''
    this.cont.querySelector('#htmlSvg').style.display = 'none'
  }

  const card = Card(this.cont, this.store)
  this.getCard = () => card.getCard()

  return card
}

CreateChart.prototype.setTransitionTime = function(transition_time) {
  this.transition_time = transition_time

  return this
}

function setCont(cont) {
  if (typeof cont === "string") cont = document.querySelector(cont)
  return cont
}