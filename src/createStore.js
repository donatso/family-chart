import CalculateTree from "./CalculateTree/CalculateTree.js"

export default function createStore(initial_state) {
  let onUpdate;
  const state = initial_state;
  state.main_id_history = [] 

  const store = {
    state,
    updateTree: (props) => {
      state.tree = calcTree();
      if (!state.main_id) updateMainId(state.tree.main_id)
      if (onUpdate) onUpdate(props)
    },
    updateData: data => state.data = data,
    updateMainId,
    getMainId: () => state.main_id,
    getData: () => state.data,
    getTree: () => state.tree,
    setOnUpdate: (f) => onUpdate = f,

    getMainDatum,
    getDatum,
    getTreeMainDatum,
    getTreeDatum,
    getLastAvailableMainDatum,

    methods: {},
  }

  return store

  function calcTree() {
    return CalculateTree({
      data: state.data, main_id: state.main_id,
      node_separation: state.node_separation, level_separation: state.level_separation,
      single_parent_empty_card: state.single_parent_empty_card,
      is_horizontal: state.is_horizontal
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
    return state.tree.data.find(d => d.data.id === state.main_id)
  }

  function getTreeDatum(id) {
    if (!state.tree) return null;
    return state.tree.data.find(d => d.id === id)
  }

  function updateMainId(id) {
    if (id === state.main_id) return
    state.main_id_history = state.main_id_history.filter(d => d !== id).slice(-10)
    state.main_id_history.push(id)
    state.main_id = id
  }

  // if main_id is deleted, get the last available main_id
  function getLastAvailableMainDatum() {
    let main_id = state.main_id_history.slice(0).reverse().find(id => getDatum(id))
    if (!main_id) main_id = state.data[0].id
    if (main_id !== state.main_id) updateMainId(main_id)
    return getDatum(main_id)
  }
}