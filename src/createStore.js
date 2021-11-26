import CalculateTree from "./CalculateTree/CalculateTree.js"
import {createTreeDataWithMainNode} from "./handlers/newPerson.js"

export default function createStore(initial_state) {
  let onUpdate;
  const state = initial_state,
    update = {
      tree: (props) => {
        state.tree = calcTree();
        if (onUpdate) onUpdate(props)
      },
      mainId: main_id => state.main_id = main_id,
      data: data => state.data = data
    },
    getData = () => state.data,
    getTree = () => state.tree,
    setOnUpdate = (f) => onUpdate = f,
    methods = {}

  return {state, update, getData, getTree, setOnUpdate, methods}


  function calcTree() {
    return CalculateTree({
      data_stash: state.data, main_id: state.main_id,
      node_separation: state.node_separation, level_separation: state.level_separation
    })
  }
}