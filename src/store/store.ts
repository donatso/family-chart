import CalculateTree from "../layout/calculate-tree"
import { Datum, Data } from "../types/data"
import { TreeDatum } from "../types/treeData"
import { Store, StoreState } from "../types/store"
import { CalculateTreeOptions, Tree } from "../layout/calculate-tree"
import { ViewProps } from "../renderers/view"

export default function createStore(initial_state: StoreState): Store {
  let onUpdate: (props?: any) => void | undefined;
  const state = {
    transition_time: 1000,
    ...initial_state,
  };
  state.main_id_history = []

  const store = {
    state,
    updateTree: (props?: ViewProps) => {
      if (!state.data || state.data.length === 0) return
      state.tree = calcTree();
      if (!state.main_id && state.tree) updateMainId(state.tree.main_id)
      if (onUpdate) onUpdate(props)
    },
    updateData: (data: Data) => {
      state.data = data;
      validateMainId();
    },
    updateMainId,
    getMainId: () => state.main_id,
    getData: () => state.data,
    getTree: () => state.tree,
    setOnUpdate: (f: (props?: ViewProps) => void) => onUpdate = f,

    getMainDatum,
    getDatum,
    getTreeMainDatum,
    getTreeDatum,
    getLastAvailableMainDatum,

    methods: {},
  }

  return store

  function calcTree(): Tree {
    const args: CalculateTreeOptions = {
      main_id: state.main_id,
    };
    
    if (state.node_separation !== undefined) args.node_separation = state.node_separation;
    if (state.level_separation !== undefined) args.level_separation = state.level_separation;
    if (state.single_parent_empty_card !== undefined) args.single_parent_empty_card = state.single_parent_empty_card;
    if (state.is_horizontal !== undefined) args.is_horizontal = state.is_horizontal;
    if (state.one_level_rels !== undefined) args.one_level_rels = state.one_level_rels;
    if (state.modifyTreeHierarchy !== undefined) args.modifyTreeHierarchy = state.modifyTreeHierarchy;
    if (state.sortChildrenFunction !== undefined) args.sortChildrenFunction = state.sortChildrenFunction;
    if (state.sortSpousesFunction !== undefined) args.sortSpousesFunction = state.sortSpousesFunction;
    if (state.ancestry_depth !== undefined) args.ancestry_depth = state.ancestry_depth;
    if (state.progeny_depth !== undefined) args.progeny_depth = state.progeny_depth;
    if (state.show_siblings_of_main !== undefined) args.show_siblings_of_main = state.show_siblings_of_main;
    if (state.private_cards_config !== undefined) args.private_cards_config = state.private_cards_config;
    if (state.duplicate_branch_toggle !== undefined) args.duplicate_branch_toggle = state.duplicate_branch_toggle;
    
    return CalculateTree(state.data, args);
  }

  function getMainDatum(): Datum {
    const datum = state.data.find(d => d.id === state.main_id);
    if (!datum) throw new Error("Main datum not found");
    return datum;
  }

  function getDatum(id: Datum['id']): Datum | undefined {
    const datum = state.data.find(d => d.id === id);
    if (!datum) return undefined;
    return datum;
  }

  function getTreeMainDatum(): TreeDatum {
    if (!state.tree) throw new Error("No tree");
    const found = state.tree.data.find(d => d.data.id === state.main_id);
    if (!found) throw new Error("No tree main datum");
    return found;
  }

  function getTreeDatum(id: Datum['id']): TreeDatum | undefined {
    if (!state.tree) throw new Error("No tree");
    const found = state.tree.data.find(d => d.data.id === id);
    if (!found) return undefined;
    return found;
  }

  function updateMainId(id: Datum['id']) {
    if (id === state.main_id) return
    state.main_id_history = state.main_id_history!.filter(d => d !== id).slice(-10)
    state.main_id_history.push(id)
    state.main_id = id
  }

  function validateMainId() {
    if (state.main_id) {
      const mainExists = state.data.find(d => d.id === state.main_id);
      if (!mainExists && state.data.length > 0) {
        // Set first datum as main if current main doesn't exist
        updateMainId(state.data[0].id)
      }
    } else {
      if (state.data.length > 0) {
        updateMainId(state.data[0].id)
      }
    }
  }

  // if main_id is deleted, get the last available main_id
  function getLastAvailableMainDatum(): Datum {
    let main_id = state.main_id_history!.slice(0).reverse().find(id => getDatum(id));
    if (!main_id && state.data.length > 0) main_id = state.data[0].id;
    if (!main_id) throw new Error("No main id");
    if (main_id !== state.main_id) updateMainId(main_id);
    const main_datum = getDatum(main_id);
    if (!main_datum) throw new Error("Main datum not found");
    return main_datum;
  }
}