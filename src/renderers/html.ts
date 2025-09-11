import * as d3 from "d3"
import createSvg from "./svg"

export default function htmlContSetup(cont: HTMLElement) {
  const getSvgView = () => cont.querySelector('svg .view') as HTMLElement
  const getHtmlView = () => cont.querySelector('#htmlSvg .cards_view') as HTMLElement

  createSvg(cont, {onZoom: onZoomSetup(getSvgView, getHtmlView)})
  createHtmlSvg(cont)

  return {
    svg: cont.querySelector('svg.main_svg') as SVGElement,
    svgView: cont.querySelector('svg .view'),
    htmlSvg: cont.querySelector('#htmlSvg'),
    htmlView: cont.querySelector('#htmlSvg .cards_view')
  }
}

function createHtmlSvg(cont: HTMLElement) {
  const f3Canvas = d3.select(cont).select('#f3Canvas')
  const cardHtml = f3Canvas.append('div').attr('id', 'htmlSvg')
    .attr('style', 'position: absolute; width: 100%; height: 100%; z-index: 2; top: 0; left: 0')
  cardHtml.append('div').attr('class', 'cards_view').style('transform-origin', '0 0')

  return cardHtml.node()
}

export function onZoomSetup(getSvgView: () => HTMLElement, getHtmlView: () => HTMLElement) {
  return function onZoom(e: any) {
    const t = e.transform
  
    d3.select(getSvgView()).style('transform', `translate(${t.x}px, ${t.y}px) scale(${t.k}) `)
    d3.select(getHtmlView()).style('transform', `translate(${t.x}px, ${t.y}px) scale(${t.k}) `)
  }
}

/** @deprecated This export will be removed in a future version. Use htmlContSetup instead. */
export { createHtmlSvg }