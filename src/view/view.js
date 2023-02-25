import {mainToMiddle, treeFit} from "./view.handlers.js"
import updateLinks from "./view.links.js"
import updateCards from "./view.cards.js"

export default function (tree, svg, Card, props={}) {

  props.initial = props.hasOwnProperty('initial') ? props.initial : !d3.select(svg).select('.card_cont').node()
  props.transition_time = props.hasOwnProperty('transition_time') ? props.transition_time : 2000;
  updateCards(svg, tree, Card, props);
  updateLinks(svg, tree, props);

  const tree_position = props.tree_position || 'fit';
  if (props.initial) treeFit({svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time: 0})
  else if (tree_position === 'fit') treeFit({svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time: props.transition_time})
  else if (tree_position === 'main_to_middle') mainToMiddle({datum: tree.data[0], svg, svg_dim: svg.getBoundingClientRect(), scale: props.scale, transition_time: props.transition_time})
  else if (tree_position === 'inherit') {}

  return true
}

export function calculateDelay(tree, d) {
  const delay_level = 800,
    ancestry_levels = Math.max(...tree.data.map(d=>d.is_ancestry ? d.depth : 0))
  let delay = d.depth*delay_level;
  if ((d.depth !== 0 || !!d.spouse) && !d.is_ancestry) {
    delay+=(ancestry_levels)*delay_level  // after ancestry
    if (d.spouse) delay+=delay_level  // spouse after bloodline
    delay+=(d.depth)*delay_level  // double the delay for each level because of additional spouse delay
  }
  return delay
}