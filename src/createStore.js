import CalculateTree from "./CalculateTree/CalculateTree.js"

export default function createStore({data, main_id}) {
  let onUpdate, calc_props={};
  const state = {data, main_id, tree: null},
    update = {
      tree: (props) => {
        state.tree = calcTree();
        if (onUpdate) onUpdate(props)
      },
      mainId: main_id => state.main_id = main_id,
      data: data => {state.data = data; update.tree()}
    },
    getData = () => state.data,
    getTree = () => state.tree,
    setOnUpdate = (f) => onUpdate = f,
    setCalcProps = props => calc_props = props;

  return {state, update, getData, getTree, setOnUpdate, setCalcProps}


  function calcTree() {
    return CalculateTree({data_stash: state.data, main_id: state.main_id, ...calc_props})
  }
}