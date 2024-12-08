import d3 from "../d3.js"

function positionTree({t, svg, transition_time=2000}) {
  const el_listener = svg.__zoomObj ? svg : svg.parentNode  // if we need listener for svg and html, we will use parent node
  const zoom = el_listener.__zoomObj

  d3.select(el_listener).transition().duration(transition_time || 0).delay(transition_time ? 100 : 0)  // delay 100 because of weird error of undefined something in d3 zoom
    .call(zoom.transform, d3.zoomIdentity.scale(t.k).translate(t.x, t.y))
}

export function treeFit({svg, svg_dim, tree_dim, with_transition, transition_time}) {
  const t = calculateTreeFit(svg_dim, tree_dim);
  positionTree({t, svg, with_transition, transition_time})
}

export function calculateTreeFit(svg_dim, tree_dim) {
  let k = Math.min(svg_dim.width / tree_dim.width, svg_dim.height / tree_dim.height)
  if (k > 1) k = 1
  const x = tree_dim.x_off + (svg_dim.width - tree_dim.width*k)/k/2
  const y = tree_dim.y_off + (svg_dim.height - tree_dim.height*k)/k/2

  return {k,x,y}
}

export function cardToMiddle({datum, svg, svg_dim, scale, transition_time}) {
  const k = scale || 1, x = svg_dim.width/2-datum.x*k, y = svg_dim.height/2-datum.y,
    t = {k, x: x/k, y: y/k}
  positionTree({t, svg, with_transition: true, transition_time})
}
