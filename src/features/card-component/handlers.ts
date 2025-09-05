import * as d3 from "d3"
import { onZoomSetup } from "../../renderers/html"
import createSvg from "../../renderers/svg"
import { TreeDatum } from "../../types/treeData"
import { BaseType } from "d3"

interface TreeDatumComponent extends TreeDatum {
  unique_id: string
}

export default function cardComponentSetup(cont: HTMLElement) {
  const getSvgView = () => cont.querySelector('svg .view') as HTMLElement
  const getHtmlSvg = () => cont.querySelector('#htmlSvg') as HTMLElement
  const getHtmlView = () => cont.querySelector('#htmlSvg .cards_view') as HTMLElement

  createSvg(cont, {onZoom: onZoomSetup(getSvgView, getHtmlView)})
  d3.select(getHtmlSvg()).append("div").attr("class", "cards_view_fake").style('display', 'none')  // important for handling data

  return setupReactiveTreeData(getHtmlSvg)
}

function setupReactiveTreeData(getHtmlSvg: () => HTMLElement) {
  let tree_data: TreeDatum[] = []

  return function getReactiveTreeData(new_tree_data: TreeDatum[]) {
    const tree_data_exit = getTreeDataExit(new_tree_data, tree_data)
    tree_data = [...new_tree_data, ...tree_data_exit]
    assignUniqueIdToTreeData(getCardsViewFake(getHtmlSvg), tree_data)
    return tree_data
  }

  function assignUniqueIdToTreeData(div: HTMLElement, tree_data: TreeDatum[]) {
    const card = d3.select(div).selectAll("div.card_cont_2fake").data(tree_data as TreeDatumComponent[], d => (d as TreeDatum).data.id)  // how this doesn't break if there is multiple cards with the same id?
    const card_exit = card.exit()
    const card_enter = card.enter().append("div").attr("class", "card_cont_2fake").style('display', 'none').attr("data-id", () => Math.random())
    const card_update = card_enter.merge(card as any)
  
    card_exit.each(cardExit)
    card_enter.each(cardEnter)
    card_update.each(cardUpdate)
  
    function cardEnter(this: HTMLElement, d: TreeDatumComponent) {
      d.unique_id = d3.select(this).attr("data-id")
    }
  
    function cardUpdate(this: HTMLElement, d: TreeDatumComponent) {
      d.unique_id = d3.select(this).attr("data-id")
    }
  
    function cardExit(this: BaseType, d: TreeDatumComponent | unknown) {
      if (!d) return
      (d as TreeDatumComponent).unique_id = d3.select(this).attr("data-id")
      d3.select(this).remove()
    }
  }

  function getTreeDataExit(new_tree_data: TreeDatum[], old_tree_data: TreeDatum[]) {
    if (old_tree_data.length > 0) {
      return old_tree_data.filter(d => !new_tree_data.find(t => t.data.id === d.data.id))
    } else {
      return []
    }
  }
}

export function getCardsViewFake(getHtmlSvg: () => HTMLElement) {
  return d3.select(getHtmlSvg()).select("div.cards_view_fake").node() as HTMLElement
}


/** @deprecated This export will be removed in a future version. Use setupReactiveTreeData instead. */
export function setupHtmlSvg(getHtmlSvg: () => HTMLElement) {
  d3.select(getHtmlSvg()).append("div").attr("class", "cards_view_fake").style('display', 'none')  // important for handling data
}

/** @deprecated This export will be removed in a future version. Use setupReactiveTreeData instead. */
const _setupReactiveTreeData = setupReactiveTreeData
export { _setupReactiveTreeData as setupReactiveTreeData }

/** @deprecated This export will be removed in a future version. Use setupReactiveTreeData instead. */
export function getUniqueId(d: any) {
  return d.unique_id
}