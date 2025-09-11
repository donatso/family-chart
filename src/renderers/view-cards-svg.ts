import * as d3 from "d3"
import {calculateEnterAndExitPositions} from "../layout/handlers"
import {calculateDelay} from "../handlers/general"
import { Tree } from "../layout/calculate-tree"
import { ViewProps } from "./view"
import { TreeDatum } from "../types/treeData"

export default function updateCardsSvg(svg: SVGElement, tree: Tree, Card: any, props: ViewProps = {}) {
  const card = d3
    .select(svg)
    .select(".cards_view")
    .selectAll<SVGGElement, TreeDatum>("g.card_cont")
    .data(tree.data, d => (d as TreeDatum).data.id)

  const card_exit = card.exit()
  const card_enter = card.enter().append("g").attr("class", "card_cont")
  const card_update = card_enter.merge(card)

  card_exit.each(d => calculateEnterAndExitPositions((d as TreeDatum), false, true))
  card_enter.each(d => calculateEnterAndExitPositions(d, true, false))

  card_exit.each(cardExit)
  card.each(cardUpdateNoEnter)
  card_enter.each(cardEnter)
  card_update.each(cardUpdate)

  function cardEnter(this: SVGGElement, d: TreeDatum) {
    d3.select(this)
      .attr("transform", `translate(${d._x}, ${d._y})`)
      .style("opacity", 0)

    Card.call(this, d)
  }

  function cardUpdateNoEnter(this: SVGGElement, d: TreeDatum) {}

  function cardUpdate(this: SVGGElement, d: TreeDatum) {
    Card.call(this, d)
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time!) : 0;
    d3.select(this).transition().duration(props.transition_time!).delay(delay).attr("transform", `translate(${d.x}, ${d.y})`).style("opacity", 1)
  }

  function cardExit(this: SVGGElement, d: unknown | TreeDatum) {
    const tree_datum = d as TreeDatum
    const pos = tree_datum ? [tree_datum._x, tree_datum._y] : [0, 0]
    const g = d3.select(this)
    g.transition().duration(props.transition_time!)
      .style("opacity", 0)
      .attr("transform", `translate(${pos[0]}, ${pos[1]})`)
      .on("end", () => g.remove())
  }
}