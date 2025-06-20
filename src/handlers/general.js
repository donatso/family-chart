import d3 from "../d3.js"

export function manualZoom({amount, svg, transition_time=500}) {
  const el_listener = svg.__zoomObj ? svg : svg.parentNode  // if we need listener for svg and html, we will use parent node
  const zoom = el_listener.__zoomObj
  d3.select(el_listener).transition().duration(transition_time || 0).delay(transition_time ? 100 : 0)  // delay 100 because of weird error of undefined something in d3 zoom
    .call(zoom.scaleBy, amount)
}

export function getCurrentZoom(svg) {
  const el_listener = svg.__zoomObj ? svg : svg.parentNode
  const currentTransform = d3.zoomTransform(el_listener)
  return currentTransform
}

export function zoomTo(svg, zoom_level) {
  const el_listener = svg.__zoomObj ? svg : svg.parentNode
  const currentTransform = d3.zoomTransform(el_listener)
  manualZoom({amount: zoom_level / currentTransform.k, svg})
}

export function isAllRelativeDisplayed(d, data) {
  const r = d.data.rels,
    all_rels = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(v => v)
  return all_rels.every(rel_id => data.some(d => d.data.id === rel_id))
}