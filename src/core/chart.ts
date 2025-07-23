import * as d3 from "d3"
import htmlContSetup from "../renderers/html"
import { removeToAddFromData } from "../store/edit"
import createStore from "../store/store"
import view from "../renderers/view"
import editTree, { EditTree } from "./edit"
import linkSpouseText from "../features/link-spouse-text"
import autocomplete from "../features/autocomplete"
import { getMaxDepth } from "../layout/handlers"
import { calculateKinships, getKinshipsDataStash } from "../features/kinships/calculate-kinships"

import { Data, Datum } from "../types/data"
import { Store, StoreState } from "../types/store"
import { TreeDatum } from "../types/treeData"

type LinkSpouseText = ((sp1: TreeDatum, sp2: TreeDatum) => string) | null
interface KinshipsConfig {
  show_in_law?: boolean,  // show in law relations
}

interface UpdateTreeProps {
  initial?: boolean;
  tree_position?: 'fit' | 'main_to_middle' | 'inherit';
  transition_time?: number;
}

export default (cont: HTMLElement, data: Data) => new CreateChart(cont, data)

class CreateChart {
  cont: HTMLElement
  store: Store
  svg: HTMLElement
  getCard: null | (() => (d:TreeDatum) => void)
  is_card_html: boolean

  transition_time: number
  linkSpouseText: LinkSpouseText | null
  personSearch: any
  beforeUpdate: Function | null
  afterUpdate: Function | null

  editTreeInstance: EditTree | null


  constructor(cont: HTMLElement, data: Data) {
    this.getCard = null
    this.transition_time = 2000
    this.linkSpouseText = null
    this.personSearch = null
  
    this.is_card_html = false
  
    this.beforeUpdate = null
    this.afterUpdate = null
    

    this.cont = setCont(cont)
    const {svg} = htmlContSetup(this.cont)
    this.svg = svg
    createNavCont(this.cont)
    const main_id = data[0].id
    this.store = this.createStore(data, main_id)
    this.setOnUpdate()

    this.editTreeInstance = null

    return this
  }

  private createStore(data: Data, main_id: Datum['id']) {
    return createStore({
      data,
      main_id,
      node_separation: 250,
      level_separation: 150,
      single_parent_empty_card: true,
      is_horizontal: false,
    })
  }

  private setOnUpdate() {
    this.store.setOnUpdate((props: Object) => {
      if (this.beforeUpdate) this.beforeUpdate(props)
      props = Object.assign({transition_time: this.store.state.transition_time}, props || {})
      if (this.is_card_html) props = Object.assign({}, props || {}, {cardHtml: true})
      view(this.store.getTree(), this.svg, this.getCard!(), props || {})
      if (this.linkSpouseText) linkSpouseText(this.svg, this.store.getTree(), Object.assign({}, props || {}, {linkSpouseText: this.linkSpouseText, node_separation: this.store.state.node_separation}))
      if (this.afterUpdate) this.afterUpdate(props)
    })
  }

  /**
   * Update the tree
   * @param props - The properties to update the tree with.
   * @param props.initial - Whether to update the tree initially.
   * @param props.tree_position - The position of the tree.
   * - 'fit' to fit the tree to the container,
   * - 'main_to_middle' to center the tree on the main person,
   * - 'inherit' to inherit the position from the previous update.
   * @param props.transition_time - The transition time.
   * @returns The CreateChart instance
   */
  updateTree(props: UpdateTreeProps = {initial: false}) {
    this.store.updateTree(props)
    return this
  }

  /**
   * Update the data
   * @param data - The data to update the tree with.
   * @returns The CreateChart instance
   */
  updateData(data: Data) {
    this.store.updateData(data)
    return this
  }

  /**
   * Set the card y spacing
   * @param card_y_spacing - The card y spacing between the cards. Level separation.
   * @returns The CreateChart instance
   */
  setCardYSpacing(card_y_spacing: StoreState['level_separation']) {
    if (typeof card_y_spacing !== 'number') {
      console.error('card_y_spacing must be a number')
      return this
    }

    this.store.state.level_separation = card_y_spacing
  
    return this
  }

  /**
   * Set the card x spacing
   * @param card_x_spacing - The card x spacing between the cards. Node separation.
   * @returns The CreateChart instance
   */
  setCardXSpacing(card_x_spacing: StoreState['node_separation']) {
    if (typeof card_x_spacing !== 'number') {
      console.error('card_x_spacing must be a number')
      return this
    }
    this.store.state.node_separation = card_x_spacing
  
    return this
  }

  /**
   * Set the orientation to vertical
   * @returns The CreateChart instance
   */
  setOrientationVertical() {
    this.store.state.is_horizontal = false
    return this
  }

  /**
   * Set the orientation to horizontal
   * @returns The CreateChart instance
   */
  setOrientationHorizontal() {
    this.store.state.is_horizontal = true
    return this
  }

  /**
   * Set whether to show the siblings of the main person
   * @param show_siblings_of_main - Whether to show the siblings of the main person.
   * @returns The CreateChart instance
   */
  setShowSiblingsOfMain(show_siblings_of_main: StoreState['show_siblings_of_main']) {
    this.store.state.show_siblings_of_main = show_siblings_of_main
  
    return this
  }
  
  /**
   * Set the private cards config
   * @param private_cards_config - The private cards config.
   * @param private_cards_config.condition - The condition to check if the card is private.
   * - Example: (d: Datum) => d.data.living === true
   * @returns The CreateChart instance
   */
  setPrivateCardsConfig(private_cards_config: StoreState['private_cards_config']) {
    this.store.state.private_cards_config = private_cards_config
  
    return this
  }
  
  /**
   * Option to set text on spouse links
   * @param linkSpouseText - The function to set the text on the spouse links.
   * - Example: (sp1, sp2) => getMarriageDate(sp1, sp2)
   * @returns The CreateChart instance
   */
  setLinkSpouseText(linkSpouseText: LinkSpouseText) {
    this.linkSpouseText = linkSpouseText
  
    return this
  }

  /**
   * Set whether to show the single parent empty card
   * @param single_parent_empty_card - Whether to show the single parent empty card.
   * @param label - The label to display for the single parent empty card.
   * @returns The CreateChart instance
   */
  setSingleParentEmptyCard(single_parent_empty_card: boolean, {label='Unknown'} = {}) {
    this.store.state.single_parent_empty_card = single_parent_empty_card
    this.store.state.single_parent_empty_card_label = label
    if (this.editTreeInstance && this.editTreeInstance.addRelativeInstance.is_active) this.editTreeInstance.addRelativeInstance.onCancel!()
    removeToAddFromData(this.store.getData() || [])

    return this
  }

  /**
   * Set the Card creation function
   * @param Card - The card function.
   * @returns The CreateChart instance
   */
  setCard(Card: any) {  // todo: CardHtml or CardSvg
    this.is_card_html = Card.is_html

    const htmlSvg = this.cont!.querySelector('#htmlSvg') as HTMLElement
    if (!htmlSvg) throw new Error('htmlSvg not found')

    if (this.is_card_html) {
      this.svg.querySelector('.cards_view')!.innerHTML = ''
      htmlSvg.style.display = 'block'
    } else {
      htmlSvg.querySelector('.cards_view')!.innerHTML = ''
      htmlSvg.style.display = 'none'
    }

    const card = Card(this.cont, this.store)
    this.getCard = () => card.getCard()

    return card
  }

  /**
   * Set the transition time
   * @param transition_time - The transition time in milliseconds
   * @returns The CreateChart instance
   */
  setTransitionTime(transition_time: StoreState['transition_time']) {
    this.store.state.transition_time = transition_time

    return this
  }

  /**
   * Set the sort children function
   * @param sortChildrenFunction - The sort children function.
   * - Example: (a, b) => a.data.birth_date - b.data.birth_date
   * @returns The CreateChart instance
   */
  setSortChildrenFunction(sortChildrenFunction: StoreState['sortChildrenFunction']) {
    this.store.state.sortChildrenFunction = sortChildrenFunction

    return this
  }

  /**
   * Set the sort spouses function
   * @param sortSpousesFunction - The sort spouses function.
   * - Example: 
   *   (d, data) => {
   *     const spouses = d.data.rels.spouses || []
   *     return spouses.sort((a, b) => {
   *       const sp1 = data.find(d0 => d0.id === a)
   *       const sp2 = data.find(d0 => d0.id === b)
   *       if (!sp1 || !sp2) return 0
   *       return getMarriageDate(d, sp1) - getMarriageDate(d, sp2)
   *    })
   *   })
   * }
   * @returns The CreateChart instance
   */
  setSortSpousesFunction(sortSpousesFunction: StoreState['sortSpousesFunction']) {
    this.store.state.sortSpousesFunction = sortSpousesFunction

    return this
  }

  /**
   * Set how many generations to show in the ancestry
   * @param ancestry_depth - The number of generations to show in the ancestry.
   * @returns The CreateChart instance
   */
  setAncestryDepth(ancestry_depth: StoreState['ancestry_depth']) {
    this.store.state.ancestry_depth = ancestry_depth

    return this
  }

  /**
   * Set how many generations to show in the progeny
   * @param progeny_depth - The number of generations to show in the progeny.
   * @returns The CreateChart instance
   */
  setProgenyDepth(progeny_depth: StoreState['progeny_depth']) {
    this.store.state.progeny_depth = progeny_depth

    return this
  }

  /**
   * Get the max depth of a person in the ancestry and progeny
   * @param d_id - The id of the person to get the max depth of.
   * @returns The max depth of the person in the ancestry and progeny. {ancestry: number, progeny: number}
   */
  getMaxDepth(d_id: Datum['id']): {ancestry: number, progeny: number} {
    return getMaxDepth(d_id, this.store.getData())
  }

  /**
   * Calculate the kinships of a person
   * @param d_id - The id of the person to calculate the kinships of.
   * @param config - The config for the kinships.
   * @param config.show_in_law - Whether to show in law relations.
   * @returns The kinships of the person.
   */
  calculateKinships(d_id: Datum['id'], config: KinshipsConfig = {}) {
    return calculateKinships(d_id, this.store.getData(), config)
  }

  /**
   * Get the kinships data stash with which we can create small family tree with relatives that connects 2 people
   * @param main_id - The id of the main person.
   * @param rel_id - The id of the person to get the kinships of.
   * @returns The kinships data stash.
   */
  getKinshipsDataStash(main_id: Datum['id'], rel_id: Datum['id']) {
    return getKinshipsDataStash(main_id, rel_id, this.store.getData(), this.calculateKinships(main_id))
  }

  /**
   * Set whether to show toggable tree branches are duplicated
   * @param duplicate_branch_toggle - Whether to show toggable tree branches are duplicated.
   * @returns The CreateChart instance
   */
  setDuplicateBranchToggle(duplicate_branch_toggle: StoreState['duplicate_branch_toggle']) {
    this.store.state.duplicate_branch_toggle = duplicate_branch_toggle

    return this
  }

  /**
   * Initialize the edit tree
   * @returns The edit tree instance.
   */
  editTree() {
    return this.editTreeInstance = editTree(this.cont, this.store)
  }

  /**
   * Update the main person
   * @param d - New main person.
   * @returns The CreateChart instance
   */
  updateMain(d: Datum) {
    let d_id: Datum['id']
    if (d.id) d_id = d.id
    else d_id = d.data.id
    this.store.updateMainId(d_id)
    this.store.updateTree({})

    return this
  }

  /**
   * Update the main person
   * @param id - New main person id.
   * @returns The CreateChart instance
   */
  updateMainId(id: Datum['id']) {
    this.store.updateMainId(id)

    return this
  }

  /**
   * Get the main person
   * @returns The main person.
   */
  getMainDatum() {
    return this.store.getMainDatum()
  }

  /**
   * Set the before update of the tree.
   * @param fn - The function to call before the update.
   * @returns The CreateChart instance
   */
  setBeforeUpdate(fn: Function) {
    this.beforeUpdate = fn
    return this
  }

  /**
   * Set the after update of the tree.
   * @param fn - The function to call after the update.
   * @returns The CreateChart instance
   */
  setAfterUpdate(fn: Function) {
    this.afterUpdate = fn
    return this
  }

  /**
   * Set the person dropdown
   * @param getLabel - The function to get the label of the person to show in the dropdown.
   * @param cont - The container to put the dropdown in.
   * @returns The CreateChart instance
   */
  setPersonDropdown(getLabel: Function, cont=this.cont!.querySelector('.f3-nav-cont') as HTMLElement) {
    this.personSearch = autocomplete(cont, onSelect.bind(this))

    this.personSearch.setOptionsGetterPerson(this.store.getData, getLabel)

    function onSelect(this: CreateChart, value: Datum['id']) {
      const datum = this.store.getDatum(value)
      if (!datum) throw new Error('Datum not found')
      if (this.editTreeInstance) this.editTreeInstance.open(datum)
      this.updateMainId(value)
      this.updateTree({initial: false})
    }
    return this
  }

  /**
   * Unset the person dropdown
   * @returns The CreateChart instance
   */
  unSetPersonSearch() {
    this.personSearch.destroy()
    this.personSearch = null
    return this
  }
}


function setCont(cont: HTMLElement | string) {
  if (typeof cont === "string") cont = document.querySelector(cont) as HTMLElement
  if (!cont) throw new Error('cont not found')
  return cont
}

function createNavCont(cont: HTMLElement) {
  d3.select(cont).append('div').attr('class', 'f3-nav-cont')
}