import d3 from "../d3.js"

import {createLinks} from "../CalculateTree/createLinks.js"
import {createPath} from "./elements/Link.js"
import {calculateDelay} from "./view.js"

export default function updateLinks(svg, tree, props={}) {
  const links_data = tree.data.reduce((acc, d) => acc.concat(createLinks({d, tree:tree.data})), []),
    link = d3.select(svg).select(".links_view").selectAll("path.link").data(links_data, d => d.id),
    link_exit = link.exit(),
    link_enter = link.enter().append("path").attr("class", "link"),
    link_update = link_enter.merge(link)

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