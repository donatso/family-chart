import d3 from "./d3.js"
import f3 from "./index.js"
import editTree from "./CreateTree/editTree.js"
import linkSpouseText from "./view/elements/LinkSpouseText.js"
import autocomplete from "./CreateTree/autocomplete.js"
import { getMaxDepth } from "./CalculateTree/CalculateTree.handlers.js"
import { calculateKinships, getKinshipsDataStash } from "./CalculateTree/CalculateTree.calculateKinships.js"

export default function(...args) { return new CreateChart(...args) }

function CreateChart(cont, data) {
  this.cont = null
  this.store = null
  this.svg = null
  this.getCard = null
  this.node_separation = 250
  this.level_separation = 150
  this.is_horizontal = false
  this.single_parent_empty_card = true
  this.transition_time = 2000
  this.linkSpouseText = false
  this.personSearch = null

  this.is_card_html = false

  this.beforeUpdate = null
  this.afterUpdate = null

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
  createNavCont(this.cont)

  this.store = f3.createStore({
    data,
    node_separation: this.node_separation,
    level_separation: this.level_separation,
    single_parent_empty_card: this.single_parent_empty_card,
    is_horizontal: this.is_horizontal
  })

  this.store.setOnUpdate(props => {
    if (this.beforeUpdate) this.beforeUpdate(props)
    props = Object.assign({transition_time: this.transition_time}, props || {})
    if (this.is_card_html) props = Object.assign({}, props || {}, {cardHtml: getHtmlSvg()})
    f3.view(this.store.getTree(), this.svg, this.getCard(), props || {})
    if (this.linkSpouseText) linkSpouseText(this.svg, this.store.getTree(), Object.assign({}, props || {}, {linkSpouseText: this.linkSpouseText, node_separation: this.node_separation}))
    if (this.afterUpdate) this.afterUpdate(props)
  })
}

CreateChart.prototype.updateTree = function(props = {initial: false}) {
  this.store.updateTree(props)

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
  this.level_separation = card_y_spacing
  this.store.state.level_separation = card_y_spacing

  return this
}

CreateChart.prototype.setCardXSpacing = function(card_x_spacing) {
  if (typeof card_x_spacing !== 'number') {
    console.error('card_x_spacing must be a number')
    return this
  }
  this.node_separation = card_x_spacing
  this.store.state.node_separation = card_x_spacing

  return this
}

CreateChart.prototype.setOrientationVertical = function() {
  this.is_horizontal = false
  this.store.state.is_horizontal = false

  return this
}

CreateChart.prototype.setOrientationHorizontal = function() {
  this.is_horizontal = true
  this.store.state.is_horizontal = true

  return this
}

CreateChart.prototype.setShowSiblingsOfMain = function(show_siblings_of_main) {
  this.store.state.show_siblings_of_main = show_siblings_of_main

  return this
}

CreateChart.prototype.setModifyTreeHierarchy = function(modifyTreeHierarchy) {
  this.store.state.modifyTreeHierarchy = modifyTreeHierarchy

  return this
}

CreateChart.prototype.setPrivateCardsConfig = function(private_cards_config) {
  this.store.state.private_cards_config = private_cards_config

  return this
}

CreateChart.prototype.setLinkSpouseText = function(linkSpouseText) {
  this.linkSpouseText = linkSpouseText

  return this
}

CreateChart.prototype.setSingleParentEmptyCard = function(single_parent_empty_card, {label='Unknown'} = {}) {
  this.single_parent_empty_card = single_parent_empty_card
  this.store.state.single_parent_empty_card = single_parent_empty_card
  this.store.state.single_parent_empty_card_label = label
  if (this.editTreeInstance && this.editTreeInstance.addRelativeInstance.is_active) this.editTreeInstance.addRelativeInstance.onCancel()
  f3.handlers.removeToAddFromData(this.store.getData() || [])

  return this
}


CreateChart.prototype.setCard = function(Card) {
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

CreateChart.prototype.setSortChildrenFunction = function(sortChildrenFunction) {
  this.store.state.sortChildrenFunction = sortChildrenFunction

  return this
}

CreateChart.prototype.setSortSpousesFunction = function(sortSpousesFunction) {
  this.store.state.sortSpousesFunction = sortSpousesFunction

  return this
}

CreateChart.prototype.setAncestryDepth = function(ancestry_depth) {
  this.store.state.ancestry_depth = ancestry_depth

  return this
}

CreateChart.prototype.setProgenyDepth = function(progeny_depth) {
  this.store.state.progeny_depth = progeny_depth

  return this
}

CreateChart.prototype.getMaxDepth = function(d_id) {
  return getMaxDepth(d_id, this.store.getData())
}

CreateChart.prototype.calculateKinships = function(d_id, config) {
  return calculateKinships(d_id, this.store.getData(), config)
}

CreateChart.prototype.getKinshipsDataStash = function(main_id, rel_id) {
  return getKinshipsDataStash(main_id, rel_id, this.store.getData(), this.calculateKinships(main_id))
}

CreateChart.prototype.setDuplicateBranchToggle = function(duplicate_branch_toggle) {
  this.store.state.duplicate_branch_toggle = duplicate_branch_toggle

  return this
}

CreateChart.prototype.editTree = function() {
  return this.editTreeInstance = editTree(this.cont, this.store)
}

CreateChart.prototype.updateMain = function(d) {
  this.store.updateMainId(d.data.id)
  this.store.updateTree({})

  return this
}

CreateChart.prototype.updateMainId = function(id) {
  this.store.updateMainId(id)

  return this
}

CreateChart.prototype.getMainDatum = function() {
  return this.store.getMainDatum()
}

CreateChart.prototype.updateData = function(data) {
  this.store.updateData(data)
}

CreateChart.prototype.setBeforeUpdate = function(fn) {
  this.beforeUpdate = fn
  return this
}

CreateChart.prototype.setAfterUpdate = function(fn) {
  this.afterUpdate = fn
  return this
}

CreateChart.prototype.setPersonDropdown = function(getLabel, cont=this.cont.querySelector('.f3-nav-cont')) {
  this.personSearch = autocomplete(cont, onSelect.bind(this))

  this.personSearch.setOptionsGetterPerson(this.store.getData, getLabel)

  function onSelect(value) {
    if (this.editTreeInstance) this.editTreeInstance.open(this.store.getDatum(value))
    this.updateMainId(value)
    this.updateTree({initial: false})
  }
  return this
}

CreateChart.prototype.unSetPersonSearch = function() {
  this.personSearch.destroy()
  this.personSearch = null
  return this
}

function setCont(cont) {
  if (typeof cont === "string") cont = document.querySelector(cont)
  return cont
}

function createNavCont(cont) {
  d3.select(cont).append('div').attr('class', 'f3-nav-cont')
}