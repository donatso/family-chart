import {CardBody, CardBodyAddNew, MiniTree, PencilIcon, PlusIcon, LinkBreakIconWrapper, CardImage} from "./Card.Elements.js"

export default function Card({
 d, card_display, card_dim, show_mini_tree, show_add, show_edit, show_hide_rels, custom_elements, maleIcon, femaleIcon
}) {
  const gender_class = d.data.data.gender === 'M' ? 'card-male' : d.data.data.gender === 'F' ? 'card-female' : 'card-genderless'
  return {template: (`
    <g class="card ${gender_class}" data-id="${d.data.id}">
      <g transform="translate(${-card_dim.w / 2}, ${-card_dim.h / 2})">
        ${!d.data.to_add && show_mini_tree ? MiniTree({d,card_dim}).template : ''}
        ${!d.data.to_add ? CardBody({d,card_dim, card_display}).template : CardBodyAddNew({d,card_dim, show_edit}).template}
        ${!d.data.to_add && show_add ? PlusIcon({d,card_dim}).template : ''}
        ${!d.data.to_add && show_edit ? PencilIcon({d,card_dim}).template : ''}
        ${!d.data.to_add ? CardImage({d,card_dim, maleIcon, femaleIcon}).template : ''}
        ${show_hide_rels ? LinkBreakIconWrapper({d,card_dim}) : ''}
        ${custom_elements ? custom_elements.map(d0 => d0.el({d,card_dim}).template).join("\n") : ''}
      </g>
    </g>
  `)}
}
