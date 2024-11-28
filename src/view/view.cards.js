import d3 from "../d3.js"
import {calculateEnterAndExitPositions} from "../CalculateTree/CalculateTree.handlers.js"
import {calculateDelay} from "./view.js"

export default function updateCards(svg, tree, Card, props={}) {
  const card = d3.select(svg).select(".cards_view").selectAll("g.card_cont").data(tree.data, d => d.data.id),
    card_exit = card.exit(),
    card_enter = card.enter().append("g").attr("class", "card_cont"),
    card_update = card_enter.merge(card)

  card_exit.each(d => calculateEnterAndExitPositions(d, false, true))
  card_enter.each(d => calculateEnterAndExitPositions(d, true, false))

  card_exit.each(cardExit)
  card.each(cardUpdateNoEnter)
  card_enter.each(cardEnter)
  card_update.each(cardUpdate)

  function cardEnter(d) {
    d3.select(this)
      .attr("transform", `translate(${d._x}, ${d._y})`)
      .style("opacity", 0)

    Card.call(this, d)
  }

  function cardUpdateNoEnter(d) {}

  function cardUpdate(d) {
    Card.call(this, d)
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time) : 0;
    d3.select(this).transition().duration(props.transition_time).delay(delay).attr("transform", `translate(${d.x}, ${d.y})`).style("opacity", 1)
  }

  function cardExit(d) {
    const g = d3.select(this)
    g.transition().duration(props.transition_time).style("opacity", 0).attr("transform", `translate(${d._x}, ${d._y})`)
      .on("end", () => g.remove())
  }
}