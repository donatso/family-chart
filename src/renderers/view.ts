import * as d3 from "d3"
import {cardToMiddle, treeFit} from "../handlers/view-handlers"
import updateLinks from "./view-links"
import updateCardsSvg from "./view-cards-svg"
import updateCardsHtml from "./view-cards-html"
import updateCardsComponent from "../features/card-component/card-component"
import { Tree } from "../layout/calculate-tree"

export interface ViewProps {
  initial?: boolean
  transition_time?: number
  cardComponent?: boolean
  cardHtml?: boolean
  cardHtmlDiv?: HTMLElement
  tree_position?: 'fit' | 'main_to_middle' | 'inherit'
  scale?: number
}

export default function(tree: Tree, svg: SVGElement, Card: any, props: ViewProps = {}) {
  props.initial = props.hasOwnProperty('initial') ? props.initial : !d3.select(svg.parentNode as HTMLElement).select('.card_cont').node()
  props.transition_time = props.hasOwnProperty('transition_time') ? props.transition_time : 1000;
  if (props.cardComponent) updateCardsComponent(svg, tree, Card, props);
  else if (props.cardHtml) updateCardsHtml(svg, tree, Card, props);
  else updateCardsSvg(svg, tree, Card, props);
  updateLinks(svg, tree, props);

  const tree_position = props.tree_position || 'fit';
  if (props.initial) treeFit({svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time: 0})
  else if (tree_position === 'fit') treeFit({svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time: props.transition_time})
  else if (tree_position === 'main_to_middle') cardToMiddle({datum: tree.data[0], svg, svg_dim: svg.getBoundingClientRect(), scale: props.scale, transition_time: props.transition_time})
  else if (tree_position === 'inherit') {}

  return true
}