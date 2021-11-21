import {
  CardBody,
  CardBodyAddNew,
  CardBodyOutline,
  CardImage,
  LinkBreakIconWrapper,
  MiniTree, PencilIcon,
  PlusIcon
} from "./Card.Elements.js"
import {cardAddRelative, cardChangeMain, cardEdit, cardShowHideRels} from "../../handlers/cardMethods.js"
import {isAllRelativeDisplayed} from "../../handlers/general.js"

export default function CardWrapper({}) {
  return Card

  function Card({d, store}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", 'g'),
      gender_class = d.data.data.gender === 'M' ? 'card-male' : d.data.data.gender === 'F' ? 'card-female' : 'card-genderless',
      card_dim = store.state.card_dim,
      show_mini_tree = !isAllRelativeDisplayed(d, store.state.tree.data),
      unknown_lbl = store.state.cardEditForm ? 'ADD' : 'UNKNOWN'

    el.innerHTML = (`
      <g class="card ${gender_class}" data-id="${d.data.id}" data-cy="card">
        <g transform="translate(${-card_dim.w / 2}, ${-card_dim.h / 2})">
          ${!d.data.to_add && show_mini_tree ? MiniTree({d,card_dim}).template : ''}
          ${CardBodyOutline({d,card_dim,is_new:d.data.to_add}).template}
          <g clip-path="url(#card_clip)">
            ${!d.data.to_add ? CardBody({d,card_dim, card_display: store.state.card_display}).template : CardBodyAddNew({d,card_dim, card_add: store.state.cardEditForm, label: unknown_lbl}).template}
            ${!d.data.to_add ? CardImage({d, image: d.data.data.avatar ? d.data.data.avatar.url : null, card_dim, maleIcon: null, femaleIcon: null}).template : ''}
            ${!d.data.to_add && store.state.cardEditForm ? PencilIcon({card_dim, x: card_dim.w-46, y: card_dim.h-20}).template : ''}
            ${!d.data.to_add && store.state.cardEditForm ? PlusIcon({card_dim, x: card_dim.w-26, y: card_dim.h-20}).template : ''}
          </g>
          ${LinkBreakIconWrapper({d,card_dim}).template}
        </g>
      </g>
    `)
    setupListeners(el, d, store);

    return el
  }

  function setupListeners(el, d, store) {
    let p;

    p = el.querySelector(".card")
    if (p) p.addEventListener("click", (e) => {e.stopPropagation();cardChangeMain(store, {card:el, d})})

    p = el.querySelector(".card_edit")
    if (p && store.state.cardEditForm) p.addEventListener("click", (e) => {e.stopPropagation();cardEdit(store, {card:el, d})})

    p = el.querySelector(".card_add")
    if (p && store.state.cardEditForm) p.addEventListener("click", (e) => {e.stopPropagation();cardEdit(store, {card:el, d})})

    p = el.querySelector(".card_add_relative")
    if (p) p.addEventListener("click", (e) => {e.stopPropagation();cardAddRelative(store, {card:el, d})})

    p = el.querySelector(".card_family_tree")
    if (p) p.addEventListener("click", (e) => {e.stopPropagation();cardChangeMain(store, {card:el, d})})

    p = el.querySelector(".card_break_link")
    if (p) p.addEventListener("click", (e) => {e.stopPropagation();cardShowHideRels(store, {card:el, d})})
  }
}
