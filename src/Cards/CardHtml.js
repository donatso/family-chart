import d3 from "../d3.js"
import f3 from "../index.js"
import {processCardDisplay} from "./utils.js"

CardHtmlWrapper.is_html = true
export default function CardHtmlWrapper(...args) { return new CardHtml(...args) }

CardHtml.prototype.is_html = true
function CardHtml(cont, store) {
  this.cont = cont
  this.store = store
  this.getCard = null
  this.card_display = [d => `${d.data["first name"]} ${d.data["last name"]}`]
  this.onCardClick = this.onCardClickDefault
  this.style = 'default'
  this.mini_tree = false
  this.onCardUpdate = null

  this.init()

  return this
}

CardHtml.prototype.init = function() {
  this.svg = this.cont.querySelector('svg.main_svg')

  this.getCard = () => f3.elements.CardHtml({
    store: this.store,
    card_display: this.card_display,
    onCardClick: this.onCardClick,
    style: this.style,
    mini_tree: this.mini_tree,
    onCardUpdate: this.onCardUpdate
  })
}

CardHtml.prototype.setCardDisplay = function(card_display) {
  this.card_display = processCardDisplay(card_display)

  return this
}

CardHtml.prototype.setOnCardClick = function(onCardClick) {
  this.onCardClick = onCardClick
  return this
}

CardHtml.prototype.onCardClickDefault = function(e, d) {
  this.store.updateMainId(d.data.id)
  this.store.updateTree({})
}

CardHtml.prototype.setStyle = function(style) {
  this.style = style
  return this
}

CardHtml.prototype.setMiniTree = function(mini_tree) {
  this.mini_tree = mini_tree

  return this
}

CardHtml.prototype.setOnCardUpdate = function(onCardUpdate) {
  this.onCardUpdate = onCardUpdate
  return this
}