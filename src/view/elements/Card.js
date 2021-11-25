import {
  CardBody,
  CardBodyAddNew,
  CardBodyOutline,
  CardImage,
  LinkBreakIconWrapper,
  MiniTree, PencilIcon,
  PlusIcon
} from "./Card.Elements.js"
import {cardChangeMain, cardEdit, cardShowHideRels} from "../../handlers/cardMethods.js"
import {isAllRelativeDisplayed} from "../../handlers/general.js"

export function Card(props) {
  props = setupProps(props);
  const store = props.store;
  setupSvgDefs()

  return function ({node, d}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", 'g'),
      gender_class = d.data.data.gender === 'M' ? 'card-male' : d.data.data.gender === 'F' ? 'card-female' : 'card-genderless',
      card_dim = props.card_dim,
      show_mini_tree = !isAllRelativeDisplayed(d, store.state.tree.data),
      unknown_lbl = props.cardEditForm ? 'ADD' : 'UNKNOWN',

      mini_tree = () => !d.data.to_add && show_mini_tree ? MiniTree({d,card_dim}).template : '',
      card_body_outline = () => CardBodyOutline({d,card_dim,is_new:d.data.to_add}).template,
      card_body = () => !d.data.to_add ? CardBody({d,card_dim, card_display: props.card_display}).template : CardBodyAddNew({d,card_dim, card_add: props.cardEditForm, label: unknown_lbl}).template,
      card_image = () => !d.data.to_add ? CardImage({d, image: d.data.data.avatar || null, card_dim, maleIcon: null, femaleIcon: null}).template : '',
      edit_icon = () => !d.data.to_add && props.cardEditForm ? PencilIcon({card_dim, x: card_dim.w-46, y: card_dim.h-20}).template : '',
      add_icon = () => !d.data.to_add && props.cardEditForm ? PlusIcon({card_dim, x: card_dim.w-26, y: card_dim.h-20}).template : '',
      link_break_icon = () => LinkBreakIconWrapper({d,card_dim})

    el.innerHTML = (`
      <g class="card ${gender_class}" data-id="${d.data.id}" data-cy="card">
        <g transform="translate(${-card_dim.w / 2}, ${-card_dim.h / 2})">
          ${props.mini_tree ? mini_tree() : ''}
          ${card_body_outline()}
          <g clip-path="url(#card_clip)">
            ${card_body()}
            ${card_image()}
            ${edit_icon()}
            ${add_icon()}
          </g>
          ${props.link_break ? link_break_icon() : ''}
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
    if (p && props.cardEditForm) p.addEventListener("click", (e) => {e.stopPropagation();cardEdit(store, {card:el, d, cardEditForm: props.cardEditForm})})

    p = el.querySelector(".card_add")
    if (p && props.cardEditForm) p.addEventListener("click", (e) => {e.stopPropagation();cardEdit(store, {card:el, d, cardEditForm: props.cardEditForm})})

    p = el.querySelector(".card_add_relative")
    if (p) p.addEventListener("click", (e) => {e.stopPropagation();props.addRelative({d})})

    p = el.querySelector(".card_family_tree")
    if (p) p.addEventListener("click", (e) => {e.stopPropagation();cardChangeMain(store, {card:el, d})})

    p = el.querySelector(".card_break_link")
    if (p) p.addEventListener("click", (e) => {e.stopPropagation();cardShowHideRels(store, {card:el, d})})
  }

  function setupSvgDefs() {
    if (props.svg.querySelector("defs#f3CardDef")) return
    const card_dim = props.card_dim
    props.svg.insertAdjacentHTML('afterbegin', (`
      <defs id="f3CardDef">
        <linearGradient id="fadeGrad">
          <stop offset="0.9" stop-color="white" stop-opacity="0"/>
          <stop offset=".91" stop-color="white" stop-opacity=".5"/>
          <stop offset="1" stop-color="white" stop-opacity="1"/>
        </linearGradient>
        <mask id="fade" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#fadeGrad)"/></mask>
        <clipPath id="card_clip"><path d="${curvedRectPath({w:card_dim.w, h:card_dim.h}, 5)}"></clipPath>
        <clipPath id="card_text_clip"><rect width="${card_dim.w-card_dim.text_x-10}" height="${card_dim.h-10}"></rect></clipPath>
        <clipPath id="card_image_clip"><path d="M0,0 Q 0,0 0,0 H${card_dim.img_w} V${card_dim.img_h} H0 Q 0,${card_dim.img_h} 0,${card_dim.img_h} z"></clipPath>
        <clipPath id="card_image_clip_curved"><path d="${curvedRectPath({w: card_dim.img_w, h:card_dim.img_h}, 5, ['rx', 'ry'])}"></clipPath>
      </defs>
    `))

    function curvedRectPath(dim, curve, no_curve_corners) {
      const {w,h} = dim,
        c = curve,
        ncc = no_curve_corners || [],
        ncc_check = (corner) => ncc.includes(corner),
        lx = ncc_check('lx') ? `M0,0` : `M0,${c} Q 0,0 5,0`,
        rx = ncc_check('rx') ? `H${w}` : `H${w-c} Q ${w},0 ${w},5`,
        ry = ncc_check('ry') ? `V${h}` : `V${h-c} Q ${w},${h} ${w-c},${h}`,
        ly = ncc_check('ly') ? `H0` : `H${c} Q 0,${h} 0,${h-c}`

      return (`${lx} ${rx} ${ry} ${ly} z`)
    }
  }

  function setupProps(props) {
    const default_props = {
      mini_tree: true,
      link_break: true,
      card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    }
    if (!props) props = {}
    for (const k in default_props) {
      if (typeof props[k] === 'undefined') props[k] = default_props[k]
    }
    return props
  }
}
