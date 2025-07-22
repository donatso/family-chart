import * as d3 from "d3"
import { onZoomSetup } from "../../renderers/html"
import createSvg from "../../renderers/svg"

export default function cardComponentSetup(cont) {
  const getSvgView = () => cont.querySelector('svg .view')
  const getHtmlSvg = () => cont.querySelector('#htmlSvg')
  const getHtmlView = () => cont.querySelector('#htmlSvg .cards_view')

  createSvg(cont, {onZoom: onZoomSetup(getSvgView, getHtmlView)})
  d3.select(getHtmlSvg()).append("div").attr("class", "cards_view_fake").style('display', 'none')  // important for handling data

  return setupReactiveTreeData(getHtmlSvg)
}

function setupReactiveTreeData(getHtmlSvg) {
  let tree_data = []

  return function getReactiveTreeData(new_tree_data) {
    const tree_data_exit = getTreeDataExit(new_tree_data, tree_data)
    tree_data = [...new_tree_data, ...tree_data_exit]
    assignUniqueIdToTreeData(getCardsViewFake(getHtmlSvg), tree_data)
    return tree_data
  }

  function assignUniqueIdToTreeData(div, tree_data) {
    const card = d3.select(div).selectAll("div.card_cont_2fake").data(tree_data, d => d.data.id)  // how this doesn't break if there is multiple cards with the same id?
    const card_exit = card.exit()
    const card_enter = card.enter().append("div").attr("class", "card_cont_2fake").style('display', 'none').attr("data-id", () => Math.random())
    const card_update = card_enter.merge(card)
  
    card_exit.each(cardExit)
    card_enter.each(cardEnter)
    card_update.each(cardUpdate)
  
    function cardEnter(d) {
      d.unique_id = d3.select(this).attr("data-id")
    }
  
    function cardUpdate(d) {
      d.unique_id = d3.select(this).attr("data-id")
    }
  
    function cardExit(d) {
      d.unique_id = d3.select(this).attr("data-id")
      d3.select(this).remove()
    }
  }

  function getTreeDataExit(new_tree_data, old_tree_data) {
    if (old_tree_data.length > 0) {
      return old_tree_data.filter(d => !new_tree_data.find(t => t.data.id === d.data.id))
    } else {
      return []
    }
  }
}

export function getCardsViewFake(getHtmlSvg) {
  return d3.select(getHtmlSvg()).select("div.cards_view_fake").node()
}