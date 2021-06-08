import d3 from "../d3.js"
import CalculateTree from "./AddRelativeTree.CalculateTree.js"
import View from "./AddRelativeTree.View.js"

export default function AddRelativeTree(store, d_id, transition_time) {
  const datum = store.getData().find(d => d.id === d_id),
    tree = CalculateTree({datum, data_stash: store.getData(), card_dim: store.state.card_dim, add_rel_labels: store.state.add_rel_labels}),
    view = View(store, tree, datum)

  const div_add_relative = document.createElement("div")
  div_add_relative.style.cssText = "width: 100%; height: 100%; position: absolute; top: 0; left: 0;background-color: rgba(0,0,0,.3);opacity: 0"
  div_add_relative.innerHTML = view.template

  store.state.cont.appendChild(div_add_relative)
  view.mounted(div_add_relative)
  d3.select(div_add_relative).transition().duration(transition_time).delay(transition_time/4).style("opacity", 1)
}
