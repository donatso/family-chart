import * as d3 from "d3"
import createSvg from "./svg"

export default function htmlContSetup(cont) {
  const getSvgView = () => cont.querySelector('svg .view')
  const getHtmlView = () => cont.querySelector('#htmlSvg .cards_view')

  createSvg(cont, {onZoom: onZoomSetup(getSvgView, getHtmlView)})
  createHtmlSvg(cont)

  return {
    svg: cont.querySelector('svg.main_svg'),
    svgView: cont.querySelector('svg .view'),
    htmlSvg: cont.querySelector('#htmlSvg'),
    htmlView: cont.querySelector('#htmlSvg .cards_view')
  }
}

function createHtmlSvg(cont) {
  const f3Canvas = d3.select(cont).select('#f3Canvas')
  const cardHtml = f3Canvas.append('div').attr('id', 'htmlSvg')
    .attr('style', 'position: absolute; width: 100%; height: 100%; z-index: 2; top: 0; left: 0')
  cardHtml.append('div').attr('class', 'cards_view').style('transform-origin', '0 0')

  return cardHtml.node()
}

export function onZoomSetup(getSvgView, getHtmlView) {
  return function onZoom(e) {
    const t = e.transform
  
    d3.select(getSvgView()).style('transform', `translate(${t.x}px, ${t.y}px) scale(${t.k}) `)
    d3.select(getHtmlView()).style('transform', `translate(${t.x}px, ${t.y}px) scale(${t.k}) `)
  }
}