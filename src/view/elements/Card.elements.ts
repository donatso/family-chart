import * as d3 from 'd3';
import {cardChangeMain, cardEdit, cardShowHideRels, type CardEditForm} from "../../handlers/cardMethods.js"
import {
  CardBody,
  CardBodyAddNew,
  CardImage,
  LinkBreakIconWrapper,
  MiniTree,
  PencilIcon,
  PlusIcon,
  type CardDisplayFn
} from "./Card.templates.ts"
import type { FamilyTreeNode, FamilyTreeNodePerson, TreePerson } from '../../types.ts';
import type { CardDim } from './Card.defs.ts';
import type { TreeStore, TreeStoreState } from '../../createStore.ts';
import addRelative from '../../CreateTree/addRelative.ts';

const CardElements = {
  miniTree,
  lineBreak,
  cardBody,
  cardImage,
  cardEdit: cardEditIcon,
  cardAdd: cardAddIcon,
}
export default CardElements

function miniTree(d: FamilyTreeNode, props: {store: TreeStore,card_dim: CardDim, onMiniTreeClick?: (e: MouseEvent,d: FamilyTreeNode)=>void}) {
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

function lineBreak(d: FamilyTreeNode, props: {card_dim: CardDim, store: TreeStore}) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(LinkBreakIconWrapper({d,card_dim}).template)
  g.on("click", (e) => {e.stopPropagation();cardShowHideRels(props.store, {d})})
  return g.node()
}

function cardBody(d: FamilyTreeNode, props: {store: TreeStore,cardEditForm?: CardEditForm,card_dim: CardDim, card_display: CardDisplayFn, onCardClick?: (e: MouseEvent,d: FamilyTreeNode) => unknown}) {
  const unknown_lbl = props.cardEditForm ? 'ADD' : 'UNKNOWN'
  const card_dim = props.card_dim;

  let g;
  if (!d.data.to_add) {
    g = d3.create('svg:g').html(CardBody({d, card_dim, card_display: props.card_display}).template)
    g.on("click", function (e) {
      e.stopPropagation();
      if (props.onCardClick) props.onCardClick.call(this, e, d)
      else cardChangeMain(props.store, {d})
    })
  } else {
    g = d3.create('svg:g').html(CardBodyAddNew({d, card_dim, card_add: props.cardEditForm, label: unknown_lbl}).template)
    g.on("click", (e) => {e.stopPropagation();cardEdit(props.store, {d, cardEditForm: props.cardEditForm})})
  }
  return g.node()
}

function cardImage(d: FamilyTreeNode, props: {card_dim:CardDim}) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(CardImage({d, image: d.data.data.avatar || null, card_dim, maleIcon: null, femaleIcon: null}).template)
  return g.node()
}

function cardEditIcon(d: FamilyTreeNode, props: {card_dim: CardDim, store: TreeStore, cardEditForm?: CardEditForm}) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(PencilIcon({card_dim, x: card_dim.w-46, y: card_dim.h-20}).template)
  g.on("click", (e) => {e.stopPropagation();cardEdit(props.store, {d, cardEditForm: props.cardEditForm})})

  return g.node()
}

function cardAddIcon(d: FamilyTreeNode, props: {card_dim: CardDim, addRelative?: ((args: {d: FamilyTreeNode}) => void) | undefined}) {
  if (d.data.to_add || !props.addRelative) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(PlusIcon({card_dim, x: card_dim.w-26, y: card_dim.h-20}).template)
  g.on("click", (e) => {e.stopPropagation();props.addRelative?.({d})})

  return g.node()
}


export function appendElement(el_maybe: Element | null | undefined, parent: Element, is_first?: unknown) {
  if (!el_maybe) return
  if (is_first) parent.insertBefore(el_maybe, parent.firstChild)
  else parent.appendChild(el_maybe)
}
