import * as d3 from 'd3';

import {createLinks, type TreeLink} from "../CalculateTree/createLinks.ts"
import {createPath} from "./elements/Link"
import {calculateDelay} from "./view.utils"

export default function updateLinks(svg, tree, props: {initial?: unknown, transition_time?:number}={}) {
  const links_data_dct = tree.data.reduce((acc, d) => {
    createLinks({d, tree:tree.data, is_horizontal: tree.is_horizontal}).forEach(l => acc[l.id] = l)
    return acc
  }, {})
  const links_data: TreeLink[] = Object.values(links_data_dct)
  const link = d3.select(svg).select(".links_view").selectAll("path.link").data(links_data, (d: any) => d.id)
  const link_exit = link.exit()
  const link_enter = link.enter().append("path").attr("class", "link")
  const link_update = link_enter.merge(link as any)

  link_exit.each(linkExit)
  link_enter.each(linkEnter)
  link_update.each(linkUpdate)

  function linkEnter(d) {
    const selectedLink= d3.select(this).attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", 1).style("opacity", 0)
    const path = createPath(d, true)
    if(path){
      selectedLink.attr("d", path)
    }
   
  }

  function linkUpdate(d) {
    const path = d3.select(this);
    const delay = props.initial ? calculateDelay(tree, d, props.transition_time) : 0
    const createdPath = createPath(d)
    const linkTransition= path.transition('path').duration(props.transition_time!).delay(delay)
    if(createdPath){
      linkTransition.attr("d", createdPath)
    }
    linkTransition.style("opacity", 1)
  }

  function linkExit(d) {
    const path = d3.select(this);
    path.transition('op').duration(800).style("opacity", 0)
    const linkTransition = path.transition('path').duration(props.transition_time!)
    const createdPath = createPath(d, true)
    if(createdPath){
      linkTransition.attr("d", createdPath)
    }
    linkTransition.on("end", () => path.remove())
  }

}