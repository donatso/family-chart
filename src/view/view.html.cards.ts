import * as d3 from 'd3';
import {calculateEnterAndExitPositions} from "../CalculateTree/CalculateTree.handlers.js"
import {calculateDelay} from "./view.utils.ts"
import type { FamilyTree } from '../CalculateTree/CalculateTree.ts';
import type { FamilyTreeNode } from '../types.ts';

export default function updateCardsHtml(div: d3.BaseType, tree: FamilyTree, Card: (d: FamilyTreeNode) => void, props: {initial?: boolean,transition_time?: number}= {}) {
  const card = d3.select(div).select(".cards_view").selectAll("div.card_cont").data(tree.data, (d:any) => d.data.id),
    card_exit = card.exit<FamilyTreeNode>(),
    card_enter = card.enter().append("div").attr("class", "card_cont").style('pointer-events', 'none'),
    card_update = card_enter.merge(card as any)

  card_exit.each(d => calculateEnterAndExitPositions(d, false, true))
  card_enter.each(d => calculateEnterAndExitPositions(d, true, false))

  card_exit.each(cardExit)
  card.each(cardUpdateNoEnter)
  card_enter.each(cardEnter)
  card_update.each(cardUpdate)

  function cardEnter(d: FamilyTreeNode) {
    d3.select(this)
      .style('position', 'absolute')
      .style('top', '0').style('left', '0')
      .style("transform", `translate(${d._x}px, ${d._y}px)`)
      .style("opacity", 0)

    Card.call(this, d)
  }

  function cardUpdateNoEnter(d: unknown) {}

  function cardUpdate(d: FamilyTreeNode) {
    Card.call(this, d)
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time ?? 0) : 0;
    d3.select(this).transition().duration(props.transition_time!).delay(delay).style("transform", `translate(${d.x}px, ${d.y}px)`).style("opacity", 1)
  }

  function cardExit(d: {_x?: number, _y?:number}) {
    const g = d3.select(this)
    g.transition().duration(props.transition_time!).style("opacity", 0).style("transform", `translate(${d._x}px, ${d._y}px)`)
      .on("end", () => g.remove())
  }
}