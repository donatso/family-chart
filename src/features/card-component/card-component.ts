import * as d3 from "d3"
import {calculateEnterAndExitPositions} from "../../layout/handlers"
import {calculateDelay} from "../../handlers/general"
import {getCardsViewFake} from "./handlers"
import { Tree } from "../../layout/calculate-tree"
import { ViewProps } from "../../renderers/view"
import { TreeDatum } from "../../types/treeData"

export default function updateCardsComponent(svg: SVGElement, tree: Tree, Card: any, props: ViewProps = {}) {
  const div = props.cardHtmlDiv ? props.cardHtmlDiv : svg.closest('#f3Canvas')!.querySelector('#htmlSvg') as HTMLElement
  const card = d3.select(getCardsViewFake(() => div)).selectAll<HTMLDivElement, TreeDatum>("div.card_cont_fake").data(tree.data, d => (d as TreeDatum).data.id)
  const card_exit = card.exit()
  const card_enter = card.enter().append("div").attr("class", "card_cont_fake").style('display', 'none')
  const card_update = card_enter.merge(card)

  card_exit.each(d => calculateEnterAndExitPositions(d as TreeDatum, false, true))
  card_enter.each(d => calculateEnterAndExitPositions(d as TreeDatum, true, false))

  card_exit.each(cardExit)
  card.each(cardUpdateNoEnter)
  card_enter.each(cardEnter)
  card_update.each(cardUpdate)

  function cardEnter(d: TreeDatum) {
    const card_element = d3.select(Card(d))

    card_element
      .style('position', 'absolute')
      .style('top', '0').style('left', '0').style("opacity", 0)
      .style("transform", `translate(${d._x}px, ${d._y}px)`)
  }

  function cardUpdateNoEnter(d: TreeDatum) {}

  function cardUpdate(d: TreeDatum) {
    const card_element = d3.select(Card(d))
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time!) : 0;
    card_element.transition().duration(props.transition_time!).delay(delay).style("transform", `translate(${d.x}px, ${d.y}px)`).style("opacity", 1)
  }

  function cardExit(this: HTMLDivElement, d: unknown | TreeDatum) {
    const tree_datum = d as TreeDatum
    const pos = tree_datum ? [tree_datum._x, tree_datum._y] : [0, 0]
    const card_element = d3.select(Card(d))
    const g = d3.select(this)
    card_element.transition().duration(props.transition_time!).style("opacity", 0).style("transform", `translate(${pos[0]}px, ${pos[1]}px)`)
      .on("end", () => g.remove()) // remove the card_cont_fake
  }
}