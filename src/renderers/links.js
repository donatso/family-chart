import * as d3 from "d3"

import {createLinks} from "../layout/create-links"
import {calculateDelay} from "../handlers/view-handlers"

export default function updateLinks(svg, tree, props={}) {
  const links_data_dct = tree.data.reduce((acc, d) => {
    createLinks({d, tree:tree.data, is_horizontal: tree.is_horizontal}).forEach(l => acc[l.id] = l)
    return acc
  }, {})
  const links_data = Object.values(links_data_dct)
  const link = d3.select(svg).select(".links_view").selectAll("path.link").data(links_data, d => d.id)
  const link_exit = link.exit()
  const link_enter = link.enter().append("path").attr("class", "link")
  const link_update = link_enter.merge(link)

  link_exit.each(linkExit)
  link_enter.each(linkEnter)
  link_update.each(linkUpdate)

  function linkEnter(d) {
    d3.select(this).attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", 1).style("opacity", 0)
      .attr("d", createPath(d, true))
  }

  function linkUpdate(d) {
    const path = d3.select(this);
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time) : 0
    path.transition('path').duration(props.transition_time).delay(delay).attr("d", createPath(d)).style("opacity", 1)
  }

  function linkExit(d) {
    const path = d3.select(this);
    path.transition('op').duration(800).style("opacity", 0)
    path.transition('path').duration(props.transition_time).attr("d", createPath(d, true))
      .on("end", () => path.remove())
  }

}

function createPath(d, is_) {
  const line = d3.line().curve(d3.curveMonotoneY),
    lineCurve = d3.line().curve(d3.curveBasis),
    path_data = is_ ? d._d() : d.d

  if (!d.curve) return line(path_data)
  else if (d.curve === true) return lineCurve(path_data)
}