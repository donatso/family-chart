import * as d3 from 'd3';

export function assignUniqueIdToTreeData(div: d3.BaseType, tree_data: {unique_id?: string}[]) {
  const card = d3.select(div).selectAll("div.card_cont_2fake").data<{unique_id?: string}>(tree_data, (d: any) => d.data.id)  // how this doesn't break if there is multiple cards with the same id?
  const card_exit = card.exit<{unique_id?: string}>()
  const card_enter = card.enter().append("div").attr("class", "card_cont_2fake").style('display', 'none').attr("data-id", () => Math.random())
  const card_update = card_enter.merge(card as any)

  card_exit.each(cardExit)
  card_enter.each(cardEnter)
  card_update.each(cardUpdate)

  function cardEnter(d: {unique_id?:string}) {
    d.unique_id = d3.select(this).attr("data-id")
  }

  function cardUpdate(d: {unique_id?:string}) {
    d.unique_id = d3.select(this).attr("data-id")
  }

  function cardExit(d: {unique_id?:string}) {
    d.unique_id = d3.select(this).attr("data-id")
    d3.select(this).remove()
  }
}

export function setupHtmlSvg(getHtmlSvg: () => d3.BaseType) {
  d3.select(getHtmlSvg()).append("div").attr("class", "cards_view_fake").style('display', 'none')  // important for handling data
}

export function getCardsViewFake(getHtmlSvg: () => d3.BaseType) {
  return d3.select(getHtmlSvg()).select("div.cards_view_fake").node()
}

export function onZoomSetup(getSvgView: () => d3.BaseType, getHtmlView: () => d3.BaseType) {
  return function onZoom(e: {transform: {x: number,y: number, k: number |string}}) {
    const t = e.transform
  
    d3.select(getSvgView()).style('transform', `translate(${t.x}px, ${t.y}px) scale(${t.k}) `)
    d3.select(getHtmlView()).style('transform', `translate(${t.x}px, ${t.y}px) scale(${t.k}) `)
  }
}

export function setupReactiveTreeData<T extends {unique_id?: string,data: {id: unknown}}>(getHtmlSvg: () => d3.BaseType) {
  let tree_data: (T)[] = []

  return function getReactiveTreeData(new_tree_data: T[]) {
    const tree_data_exit = getTreeDataExit(new_tree_data, tree_data)
    tree_data = [...new_tree_data, ...tree_data_exit]
    assignUniqueIdToTreeData(getCardsViewFake(getHtmlSvg), tree_data)
    return tree_data
  }
}

export function createHtmlSvg(cont: d3.BaseType) {
  const f3Canvas = d3.select(cont).select('#f3Canvas')
  const cardHtml = f3Canvas.append('div').attr('id', 'htmlSvg')
    .attr('style', 'position: absolute; width: 100%; height: 100%; z-index: 2; top: 0; left: 0')
  cardHtml.append('div').attr('class', 'cards_view').style('transform-origin', '0 0')
  setupHtmlSvg(() => cardHtml.node())

  return cardHtml.node()
}

function getTreeDataExit<TNew extends {data: {id: unknown}},TOld extends {data: {id: unknown}}>(new_tree_data: TNew[], old_tree_data: TOld[]) {
  if (old_tree_data.length > 0) {
    return old_tree_data.filter(d => !new_tree_data.find(t => t.data.id === d.data.id))
  } else {
    return []
  }
}

export function getUniqueId(d:{unique_id:string}){
  return d.unique_id
}