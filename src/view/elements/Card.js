import {CardBody, CardBodyAddNew, MiniTree, PencilIcon, PlusIcon, LinkBreakIcon, CardImage} from "./Card.Elements.js"

export default function Card({d, card_display, card_dim, show_mini_tree, show_add, show_edit, show_hide_rels, custom_elements}) {
  return {template: (`
    <g class="card" data-id="${d.data.id}">
      <g transform="translate(${-card_dim.w / 2}, ${-card_dim.h / 2})">
        ${!d.data.to_add && show_mini_tree ? MiniTree({d,card_dim}).template : ''}
        ${!d.data.to_add ? CardBody({d,card_dim, card_display}).template : CardBodyAddNew({d,card_dim, show_edit}).template}
        ${!d.data.to_add && show_add ? PlusIcon({d,card_dim}).template : ''}
        ${!d.data.to_add && show_edit ? PencilIcon({d,card_dim}).template : ''}
        ${!d.data.to_add ? CardImage({d,card_dim}).template : ''}
        ${show_hide_rels ? LinkBreakIconWrapper({d,card_dim}) : ''}
        ${custom_elements ? custom_elements.map(d => d.el).join("\n") : ''}
      </g>
    </g>
  `)}
}

function LinkBreakIconWrapper({d,card_dim}) {
  let g = "",
    r = d.data.rels, _r = d.data._rels || {},
    closed = d.data.hide_rels,
    areParents = r => r.father || r.mother,
    areChildren = r => r.children && r.children.length > 0
  if ((d.is_ancestry || d.data.main) && (areParents(r) || areParents(_r))) {g+=LinkBreakIcon({x:card_dim.w/2,y:0, rt: -45, closed}).template}
  if (!d.is_ancestry && d.added) {
    const sp = d.spouse, sp_r = sp.data.rels, _sp_r = sp.data._rels || {};
    if ((areChildren(r) || areChildren(_r)) && (areChildren(sp_r) || areChildren(_sp_r))) {
      g+=LinkBreakIcon({x:d.sx - d.x + card_dim.w/2 +24.4,y: (d.x !== d.sx ? card_dim.h/2 : card_dim.h)+1, rt: 135, closed}).template
    }
  }
  return g
}
