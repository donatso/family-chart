import * as d3 from 'd3';
import {calculateEnterAndExitPositions} from "../CalculateTree/CalculateTree.handlers.ts"
import {calculateDelay} from "./view.utils.ts"
import type { FamilyTree } from '../CalculateTree/CalculateTree.ts';
import type { FamilyTreeNode } from '../types.ts';

export default function updateCards(svg:d3.BaseType , tree: FamilyTree, Card: (d:unknown) => void, props: {initial?: boolean,transition_time?: number,}={}) {
  const card = d3.select(svg).select(".cards_view").selectAll("g.card_cont").data(tree.data, (d: any) => d.data.id),
    card_exit = card.exit<FamilyTreeNode>(),
    card_enter = card.enter().append("g").attr("class", "card_cont"),
    card_update = card_enter.merge(card as any )

  card_exit.each(d => calculateEnterAndExitPositions(d, false, true))
  card_enter.each(d => calculateEnterAndExitPositions(d, true, false))

  card_exit.each(cardExit)
  card.each(cardUpdateNoEnter)
  card_enter.each(cardEnter)
  card_update.each(cardUpdate)

  function cardEnter(d: {_x?:number, _y?:number}) {
    d3.select(this)
      .attr("transform", `translate(${d._x}, ${d._y})`)
      .style("opacity", 0)

    Card.call(this, d)
  }

  function cardUpdateNoEnter(d: unknown) {}

  function cardUpdate(d: Pick<FamilyTreeNode,'is_ancestry'| 'x' | 'y' | 'spouse' | 'depth'>) {
    Card.call(this, d)
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time ?? 0) : 0;
    d3.select(this).transition().duration(props.transition_time!).delay(delay).attr("transform", `translate(${d.x}, ${d.y})`).style("opacity", 1)
  }

  function cardExit(d: {_x?: number, _y?:number}) {
    const g = d3.select(this)
    g.transition().duration(props.transition_time!).style("opacity", 0).attr("transform", `translate(${d._x}, ${d._y})`)
      .on("end", () => g.remove())
  }
}