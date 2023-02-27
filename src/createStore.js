import CalculateTree from "./CalculateTree/CalculateTree.js"

export default function createStore(initial_state) {
  let onUpdate;
  const state = initial_state;

  const store = {
    state,
    updateTree: (props) => {
      state.tree = calcTree();
      if (onUpdate) onUpdate(props)
    },
    updateData: data => state.data = data,
    updateMainId: main_id => state.main_id = main_id,
    getData: () => state.data,
    getTree: () => state.tree,
    setOnUpdate: (f) => onUpdate = f,
    methods: {}
  }

  return store

  function calcTree() {
    return CalculateTree({
      data: state.data, main_id: state.main_id,
      node_separation: state.node_separation, level_separation: state.level_separation
    })
  }
}