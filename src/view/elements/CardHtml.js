import d3 from "../../d3.js"
import {personSvgIcon, miniTreeSvgIcon} from "./Card.icons.js"

export function CardHtml(props) {
  const cardInner = props.style === 'default' ? cardInnerDefault 
  : props.style === 'imageCircle' ? cardInnerImageCircle 
  : props.style === 'imageRect' ? cardInnerImageRect
  : props.style === 'rect' ? cardInnerRect
  : cardInnerDefault

  return function (d) {
    this.innerHTML = (`
    <div class="card ${getClassList(d).join(' ')}"" style="transform: translate(-50%, -50%)">
      ${props.mini_tree ? getMiniTree(d) : ''}
      ${cardInner(d)}
    </div>
    `)
    this.querySelector('.card').addEventListener('click', e => props.onCardClick(e, d))
    if (props.onCardUpdate) props.onCardUpdate.call(this, d)
  }

  function getCardInnerImageCircle(d) {
    return (`
    <div class="card-inner card-image-circle">
      ${d.data.data.avatar ? `<img src="${d.data.data["avatar"]}">` : personSvgIcon()}
      <div class="card-label">${textDisplay(d)}</div>
    </div>
    `)
  }

  function getCardInnerImageRect(d) {
    return (`
    <div class="card-inner card-image-rect">
      ${d.data.data.avatar ? `<img src="${d.data.data["avatar"]}">` : personSvgIcon()}
      <div class="card-label">${textDisplay(d)}</div>
    </div>
    `)
  }

  function getCardInnerRect(d) {
    return (`
    <div class="card-inner card-rect">
      ${textDisplay(d)}
    </div>
    `)
  }

  function textDisplay(d) {
    return (`
      ${props.card_display.map(display => `<div>${display(d.data)}</div>`).join('')}
    `)
  }

  function getMiniTree(d) {
    if (!props.mini_tree) return ''
    if (d.data.to_add) return ''
    if (d.all_rels_displayed) return ''
    return `<div class="mini-tree">${miniTreeSvgIcon()}</div>`
  }

  function cardInnerDefault(d) {
    return d.data.data.avatar ? cardInnerImageCircle(d) : cardInnerRect(d)
  }

  function cardInnerImageCircle(d) {
    return getCardInnerImageCircle(d)
  }

  function cardInnerImageRect(d) {
    return getCardInnerImageRect(d)
  }

  function cardInnerRect(d) {
    return getCardInnerRect(d)
  }

  function getClassList(d) {
    const class_list = []
    if (d.data.data.gender === 'M') class_list.push('card-male')
    else if (d.data.data.gender === 'F') class_list.push('card-female')
    else class_list.push('card-genderless')

    if (d.data.main) class_list.push('card-main')

    return class_list
  }
}
