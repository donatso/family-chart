import d3 from "../d3.js"
import {cardToMiddle, treeFit} from "./view.handlers.js"
import updateLinks from "./view.links.js"
import updateCards from "./view.cards.js"
import updateCardsHtml from "./view.html.cards.js"
import updateCardsComponent from "./view.html.component.js"

export default function(tree, svg, Card, props={}) {

  props.initial = props.hasOwnProperty('initial') ? props.initial : !d3.select(svg.parentNode).select('.card_cont').node()
  props.transition_time = props.hasOwnProperty('transition_time') ? props.transition_time : 2000;
  if (props.cardComponent) updateCardsComponent(props.cardComponent, tree, Card, props);
  else if (props.cardHtml) updateCardsHtml(props.cardHtml, tree, Card, props);
  else updateCards(svg, tree, Card, props);
  updateLinks(svg, tree, props);

  const tree_position = props.tree_position || 'fit';
  if (props.initial) treeFit({svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time: 0})
  else if (tree_position === 'fit') treeFit({svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time: props.transition_time})
  else if (tree_position === 'main_to_middle') cardToMiddle({datum: tree.data[0], svg, svg_dim: svg.getBoundingClientRect(), scale: props.scale, transition_time: props.transition_time})
  else if (tree_position === 'inherit') {}

  return true
}

export function calculateDelay(tree, d, transition_time) {
  const delay_level = transition_time*.4,
    ancestry_levels = Math.max(...tree.data.map(d=>d.is_ancestry ? d.depth : 0))
  let delay = d.depth*delay_level;
  if ((d.depth !== 0 || !!d.spouse) && !d.is_ancestry) {
    delay+=(ancestry_levels)*delay_level  // after ancestry
    if (d.spouse) delay+=delay_level  // spouse after bloodline
    delay+=(d.depth)*delay_level  // double the delay for each level because of additional spouse delay
  }
  return delay
}