import * as d3 from 'd3';
import {calculateEnterAndExitPositions} from "../CalculateTree/CalculateTree.handlers.js"
import {calculateDelay} from "./view.utils.ts"
import {getCardsViewFake} from "./view.html.handlers.ts"
import type { FamilyTreeNode } from '../types.ts';
import type { FamilyTree } from '../CalculateTree/CalculateTree.ts';
import type { TreeLink } from '../CalculateTree/createLinks.ts';

export default function updateCardsComponent(div: d3.BaseType, tree: FamilyTree, Card: (d: unknown) => d3.BaseType, props: {initial?:boolean,transition_time?: number}= {}) {
  const card = d3.select(getCardsViewFake(() => div)).selectAll("div.card_cont_fake").data<FamilyTreeNode>(tree.data, (d: any) => d.data.id),
    card_exit = card.exit<FamilyTreeNode>(),
    card_enter = card.enter().append("div").attr("class", "card_cont_fake").style('display', 'none'),
    card_update = card_enter.merge(card as any)

  card_exit.each(d => calculateEnterAndExitPositions(d, false, true))
  card_enter.each(d => calculateEnterAndExitPositions(d, true, false))

  card_exit.each(cardExit)
  card.each(cardUpdateNoEnter)
  card_enter.each(cardEnter)
  card_update.each(cardUpdate)
  function cardEnter(d: {_x?: number, _y?:number}) {
    const card_element = d3.select(Card(d))
    card_element
      .style('position', 'absolute')
      .style('top', '0').style('left', '0').style("opacity", 0)
      .style("transform", `translate(${d._x}px, ${d._y}px)`)
  }

  function cardUpdateNoEnter(d: unknown) {}

  function cardUpdate(d: FamilyTreeNode) {
    const card_element = d3.select(Card(d))
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time ?? 0) : 0;
    card_element.transition().duration(props.transition_time!).delay(delay).style("transform", `translate(${d.x}px, ${d.y}px)`).style("opacity", 1)
  }

  function cardExit(d: FamilyTreeNode) {
    const card_element = d3.select(Card(d))
    const g = d3.select(this)
    card_element.transition().duration(props.transition_time!).style("opacity", 0).style("transform", `translate(${d._x}px, ${d._y}px)`)
      .on("end", () => g.remove()) // remove the card_cont_fake
  }
}