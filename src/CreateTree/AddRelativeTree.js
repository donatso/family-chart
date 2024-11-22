import d3 from "../d3.js"
import CalculateTree from "./AddRelativeTree.CalculateTree.js"
import View from "./AddRelativeTree.View.js"

export default function AddRelativeTree(props) {
  const tree = CalculateTree(props),
    view = View(tree, props)

  const div_add_relative = document.createElement("div")
  div_add_relative.style.cssText = "width: 100%; height: 100%; position: absolute; top: 0; left: 0;background-color: rgba(0,0,0,.3);opacity: 0"
  div_add_relative.innerHTML = view.template

  props.cont.appendChild(div_add_relative)
  view.mounted(div_add_relative)
  d3.select(div_add_relative).transition().duration(props.transition_time).delay(props.transition_time/4).style("opacity", 1)
}
