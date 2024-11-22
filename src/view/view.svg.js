import d3 from "../d3.js"

export default function createSvg(cont, props={}) {
  const svg_dim = cont.getBoundingClientRect();
  const svg_html = (`
    <svg class="main_svg">
      <rect width="${svg_dim.width}" height="${svg_dim.height}" fill="transparent" />
      <g class="view">
        <g class="links_view"></g>
        <g class="cards_view"></g>
      </g>
      <g style="transform: translate(100%, 100%)">
        <g class="fit_screen_icon cursor-pointer" style="transform: translate(-50px, -50px); display: none">
          <rect width="27" height="27" stroke-dasharray="${27/2}" stroke-dashoffset="${27/4}" 
            style="stroke:#fff;stroke-width:4px;fill:transparent;"/>
          <circle r="5" cx="${27/2}" cy="${27/2}" style="fill:#fff" />          
        </g>
      </g>
    </svg>
  `)

  const f3Canvas = getOrCreateF3Canvas(cont)

  const temp_div = d3.create('div').node()
  temp_div.innerHTML = svg_html
  const svg = temp_div.querySelector('svg')
  f3Canvas.appendChild(svg)

  cont.appendChild(f3Canvas)

  setupZoom(f3Canvas, props)

  return svg

  function getOrCreateF3Canvas(cont) {
    let f3Canvas = cont.querySelector('#f3Canvas')
    if (!f3Canvas) {
      f3Canvas = d3.create('div').attr('id', 'f3Canvas').attr('style', 'position: relative; overflow: hidden; width: 100%; height: 100%;').node()
    }
    return f3Canvas
  }
}

function setupZoom(el, props={}) {
  if (el.__zoom) return
  const view = el.querySelector('.view'),
    zoom = d3.zoom().on("zoom", (props.onZoom || zoomed))

  d3.select(el).call(zoom)
  el.__zoomObj = zoom

  if (props.zoom_polite) zoom.filter(zoomFilter)

  function zoomed(e) {
    d3.select(view).attr("transform", e.transform);
  }

  function zoomFilter(e) {
    if (e.type === "wheel" && !e.ctrlKey) return false
    else if (e.touches && e.touches.length < 2) return false
    else return true
  }
}