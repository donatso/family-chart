import * as d3 from 'd3';
import {cardToMiddle, treeFit} from "./view.handlers.ts"
import updateLinks from "./view.links.ts"
import updateCards from "./view.cards.js"
import updateCardsHtml from "./view.html.cards.ts"
import updateCardsComponent from "./view.html.component.ts"

export default function(tree, svg, Card, props: {tree_position?:string,cardComponent?: any, cardHtml?: any, initial?: boolean, transition_time?: number, scale?:any}={}) {

  props.initial = props.hasOwnProperty('initial') ? props.initial : !d3.select(svg.parentNode).select('.card_cont').node()
  props.transition_time = props.hasOwnProperty('transition_time') ? props.transition_time : 2000;
  if (props.cardComponent) updateCardsComponent(props.cardComponent, tree, Card, props);
  else if (props.cardHtml) updateCardsHtml(props.cardHtml, tree, Card, props);
  else updateCards(svg, tree, Card, props);
  updateLinks(svg, tree, props);

  const tree_position = props.tree_position || 'fit';
  if (props.initial) treeFit({t: tree,svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time: 0})
  else if (tree_position === 'fit') treeFit({t:tree, svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time: props.transition_time})
  else if (tree_position === 'main_to_middle') cardToMiddle({datum: tree.data[0], svg, svg_dim: svg.getBoundingClientRect(), scale: props.scale, transition_time: props.transition_time})
  else if (tree_position === 'inherit') {}

  return true
}