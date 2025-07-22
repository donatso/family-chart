import * as d3 from "d3"
import {calculateEnterAndExitPositions} from "../../layout/handlers"
import {calculateDelay} from "../../handlers/general"
import {getCardsViewFake} from "./handlers"

export default function updateCardsComponent(svg, tree, Card, props={}) {
  const div = props.cardHtmlDiv ? props.cardHtmlDiv : svg.closest('#f3Canvas').querySelector('#htmlSvg')
  const card = d3.select(getCardsViewFake(() => div)).selectAll("div.card_cont_fake").data(tree.data, d => d.data.id)
  const card_exit = card.exit()
  const card_enter = card.enter().append("div").attr("class", "card_cont_fake").style('display', 'none')
  const card_update = card_enter.merge(card)

  card_exit.each(d => calculateEnterAndExitPositions(d, false, true))
  card_enter.each(d => calculateEnterAndExitPositions(d, true, false))

  card_exit.each(cardExit)
  card.each(cardUpdateNoEnter)
  card_enter.each(cardEnter)
  card_update.each(cardUpdate)

  function cardEnter(d) {
    const card_element = d3.select(Card(d))

    card_element
      .style('position', 'absolute')
      .style('top', '0').style('left', '0').style("opacity", 0)
      .style("transform", `translate(${d._x}px, ${d._y}px)`)
  }

  function cardUpdateNoEnter(d) {}

  function cardUpdate(d) {
    const card_element = d3.select(Card(d))
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time) : 0;
    card_element.transition().duration(props.transition_time).delay(delay).style("transform", `translate(${d.x}px, ${d.y}px)`).style("opacity", 1)
  }

  function cardExit(d) {
    const card_element = d3.select(Card(d))
    const g = d3.select(this)
    card_element.transition().duration(props.transition_time).style("opacity", 0).style("transform", `translate(${d._x}px, ${d._y}px)`)
      .on("end", () => g.remove()) // remove the card_cont_fake
  }
}