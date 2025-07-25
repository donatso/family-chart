import * as d3 from "d3"
import {cardChangeMain, cardShowHideRels} from "./methods"
import {
  CardBody,
  CardImage,
  LinkBreakIconWrapper,
  MiniTree,
} from "./templates"
import { Store } from "../../types/store"
import { TreeDatum } from "../../types/treeData"
import { CardDim } from "./templates"

const CardElements = {
  miniTree,
  lineBreak,
  cardBody,
  cardImage
}
export default CardElements



function miniTree(d: TreeDatum, props: {card_dim: CardDim, onMiniTreeClick?: (e: MouseEvent, d: TreeDatum) => void, store: Store}) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  if (d.all_rels_displayed) return
  const g = d3.create('svg:g').html(MiniTree({d,card_dim}).template)
  g.on("click", function (e) {
    e.stopPropagation();
    if (props.onMiniTreeClick) props.onMiniTreeClick.call(this, e, d)
    else cardChangeMain(props.store, {d})
  })
  return g.node()
}

function lineBreak(d: TreeDatum, props: {card_dim: CardDim, onLineBreakClick?: (e: MouseEvent, d: TreeDatum) => void, store: Store}) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(LinkBreakIconWrapper({d,card_dim}).template)
  g.on("click", (e) => {e.stopPropagation();cardShowHideRels(props.store, {d})})
  return g.node()
}

function cardBody(d: TreeDatum, props: {card_dim: CardDim, onCardClick: (e: MouseEvent, d: TreeDatum) => void, store: Store, card_display: (data: TreeDatum['data']) => string}) {
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(CardBody({d, card_dim, card_display: props.card_display}).template)
  g.on("click", function (e) {
    e.stopPropagation();
    if (props.onCardClick) props.onCardClick.call(this, e, d)
    else cardChangeMain(props.store, {d})
  })

  return g.node()
}

function cardImage(d: TreeDatum, props: {card_dim: CardDim, store: Store}) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(CardImage({d, image: d.data.data.avatar || null, card_dim, maleIcon: undefined, femaleIcon: undefined}).template)
  return g.node()
}

export function appendElement(el_maybe: Element, parent: Element, is_first: boolean = false) {
  if (!el_maybe) return
  if (is_first) parent.insertBefore(el_maybe, parent.firstChild)
  else parent.appendChild(el_maybe)
}
