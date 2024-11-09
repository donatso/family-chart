import d3 from "../../d3.js"
import {isAllRelativeDisplayed} from "../../handlers/general.js"
import {cardChangeMain, cardEdit, cardShowHideRels} from "../../handlers/cardMethods.js"
import {
  CardBody,
  CardBodyAddNew,
  CardImage,
  LinkBreakIconWrapper,
  MiniTree,
  PencilIcon,
  PlusIcon
} from "./Card.templates.js"

const CardElements = {
  miniTree,
  lineBreak,
  cardBody,
  cardImage,
  cardEdit: cardEditIcon,
  cardAdd: cardAddIcon,
}
export default CardElements

function miniTree(d, props) {
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

function lineBreak(d, props) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(LinkBreakIconWrapper({d,card_dim}).template)
  g.on("click", (e) => {e.stopPropagation();cardShowHideRels(props.store, {d})})
  return g.node()
}

function cardBody(d, props) {
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

function cardImage(d, props) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(CardImage({d, image: d.data.data.avatar || null, card_dim, maleIcon: null, femaleIcon: null}).template)
  return g.node()
}

function cardEditIcon(d, props) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(PencilIcon({card_dim, x: card_dim.w-46, y: card_dim.h-20}).template)
  g.on("click", (e) => {e.stopPropagation();cardEdit(props.store, {d, cardEditForm: props.cardEditForm})})

  return g.node()
}

function cardAddIcon(d, props) {
  if (d.data.to_add) return
  const card_dim = props.card_dim;
  const g = d3.create('svg:g').html(PlusIcon({card_dim, x: card_dim.w-26, y: card_dim.h-20}).template)
  g.on("click", (e) => {e.stopPropagation();props.addRelative({d})})

  return g.node()
}


export function appendElement(el_maybe, parent, is_first) {
  if (!el_maybe) return
  if (is_first) parent.insertBefore(el_maybe, parent.firstChild)
  else parent.appendChild(el_maybe)
}
