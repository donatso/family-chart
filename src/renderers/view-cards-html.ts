import * as d3 from "d3"
import {calculateEnterAndExitPositions} from "../layout/handlers"
import {calculateDelay} from "../handlers/general"
import { Tree } from "../layout/calculate-tree"
import { ViewProps } from "./view"
import { TreeDatum } from "../types/treeData"
import { CardHtmlSelection } from "../types/view"

export default function updateCardsHtml(svg: SVGElement, tree: Tree, Card: any, props: ViewProps = {}) {
  const div = getHtmlDiv(svg)
  const card: CardHtmlSelection = d3.select(div).select(".cards_view").selectAll<HTMLDivElement, TreeDatum>("div.card_cont").data(tree.data, d => (d as TreeDatum).tid!)
  const card_exit = card.exit()
  const card_enter = card.enter().append("div").attr("class", "card_cont").style('pointer-events', 'none')
  const card_update = card_enter.merge(card)

  card_exit.each(d => calculateEnterAndExitPositions((d as TreeDatum), false, true))
  card_enter.each(d => calculateEnterAndExitPositions((d as TreeDatum), true, false))

  card_exit.each(cardExit)
  card.each(cardUpdateNoEnter)
  card_enter.each(cardEnter)
  card_update.each(cardUpdate)

  function cardEnter(this: HTMLDivElement, d: TreeDatum) {
    d3.select(this)
      .style('position', 'absolute')
      .style('top', '0').style('left', '0')
      .style("transform", `translate(${d._x}px, ${d._y}px)`)
      .style("opacity", 0)

    Card.call(this, d)
  }

  function cardUpdateNoEnter(this: HTMLDivElement, d: TreeDatum) {}

  function cardUpdate(this: HTMLDivElement, d: TreeDatum) {
    Card.call(this, d)
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time!) : 0;
    d3.select(this).transition().duration(props.transition_time!).delay(delay).style("transform", `translate(${d.x}px, ${d.y}px)`).style("opacity", 1)
  }

  function cardExit(this: HTMLDivElement, d: unknown | TreeDatum) {
    const tree_datum = d as TreeDatum
    const pos = tree_datum ? [tree_datum._x, tree_datum._y] : [0, 0]
    const g = d3.select(this)
    g.transition().duration(props.transition_time!)
      .style("opacity", 0)
      .style("transform", `translate(${pos[0]}px, ${pos[1]}px)`)
      .on("end", () => g.remove())
  }

  function getHtmlDiv(svg: SVGElement) {
    if (props.cardHtmlDiv) return props.cardHtmlDiv
    const canvas = svg.closest('#f3Canvas')
    if (!canvas) throw new Error('canvas not found')
    const htmlSvg = canvas.querySelector('#htmlSvg')
    if (!htmlSvg) throw new Error('htmlSvg not found')
    return htmlSvg as HTMLElement
  }
}