import CalculateTree from "./CalculateTree/CalculateTree.js"

export default function createStore(initial_state) {
  let onUpdate;
  const state = initial_state;

  const store = {
    state,
    updateTree: (props) => {
      state.tree = calcTree();
      if (!state.main_id) updateMainId(state.tree.main_id)
      if (onUpdate) onUpdate(props)
    },
    updateData: data => state.data = data,
    updateMainId,
    getData: () => state.data,
    getTree: () => state.tree,
    setOnUpdate: (f) => onUpdate = f,

    getMainDatum,
    getDatum,
    getTreeMainDatum,
    getTreeDatum,

    methods: {},
  }

  return store

  function calcTree() {
    let main_id = null
    const main_datum = (getDatum(state.main_id) || getDatum(state._main_id))
    if (main_datum) main_id = main_datum.id
    return CalculateTree({
      data: state.data, main_id,
      node_separation: state.node_separation, level_separation: state.level_separation
    })
  }

  function getMainDatum() {
    return state.data.find(d => d.id === state.main_id)
  }

  function getDatum(id) {
    return state.data.find(d => d.id === id)
  }

  function getTreeMainDatum() {
    if (!state.tree) return null;
    return state.tree.data.find(d => d.id === state.main_id)
  }

  function getTreeDatum(id) {
    if (!state.tree) return null;
    return state.tree.data.find(d => d.id === id)
  }

  function updateMainId(id) {
    if (id === state.main_id) return
    state._main_id = state.main_id
    state.main_id = id
  }
}
