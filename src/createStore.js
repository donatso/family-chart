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

    getMainDatum: () => state.data.find(d => d.main),
    getDatum: id => state.data.find(d => d.id === id),
    getTreeMainDatum,
    getTreeDatum,

    methods: {},
  }

  return store

  function calcTree() {
    return CalculateTree({
      data: state.data, main_id: state.main_id,
      node_separation: state.node_separation, level_separation: state.level_separation
    })
  }

  function getTreeMainDatum() {
    if (!state.tree) return null;
    return state.tree.data.find(d => d.data.main)
  }

  function getTreeDatum(id) {
    if (!state.tree) return null;
    return state.tree.data.find(d => d.id === id)
  }
}