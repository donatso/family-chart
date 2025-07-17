import { Datum, Data } from './data';
import { TreeData, TreeDatum } from './treeData';

export interface StoreState {
  data: Data;
  main_id: Datum['id'];
  main_id_history: Datum['id'][];
  tree?: {
    data: TreeData;
    data_stash: Data;
    dim: { width: number; height: number; x_off: number; y_off: number; };
    main_id: Datum['id'];
    is_horizontal: boolean;
    [key: string]: any;
  };
  node_separation?: number;
  level_separation?: number;
  single_parent_empty_card?: boolean;
  is_horizontal?: boolean;
  one_level_rels?: boolean;
  sortChildrenFunction?: (a: Datum, b: Datum) => number;
  sortSpousesFunction?: (a: Datum, b: Datum) => number;
  ancestry_depth?: number;
  progeny_depth?: number;
  show_siblings_of_main?: boolean;
  modifyTreeHierarchy?: (tree: any) => any;
  private_cards_config?: any;
  duplicate_branch_toggle?: boolean;
  [key: string]: any;
}

export interface Store {
  state: StoreState;
  updateTree: (props?: any) => void;
  updateData: (data: Data) => void;
  updateMainId: (id: Datum['id']) => void;
  getMainId: () => Datum['id'];
  getData: () => Data;
  getTree: () => StoreState['tree'];
  setOnUpdate: (f: (props?: any) => void) => void;
  getMainDatum: () => Datum;
  getDatum: (id: Datum['id']) => Datum | undefined;
  getTreeMainDatum: () => TreeDatum;
  getTreeDatum: (id: Datum['id']) => TreeDatum | undefined;
  getLastAvailableMainDatum: () => Datum | undefined;
  methods: { [key: string]: (...args: any[]) => any };
}

export interface UpdateTreeProps {
  initial?: boolean;
  tree_position?: 'fit' | 'main_to_middle' | 'inherit';
  transition_time?: number;
}