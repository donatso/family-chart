import { Datum, Data } from './data';
import { TreeData, TreeDatum } from './treeData';
import { CalculateTreeOptions, Tree } from '../layout/calculate-tree';
import { ViewProps } from '../renderers/view';

export interface StoreState extends CalculateTreeOptions {
  data: Data;
  main_id: Datum['id'];
  main_id_history?: Datum['id'][];
  tree?: Tree;

  transition_time?: number;
  single_parent_empty_card_label?: string;
}

export interface Store {
  state: StoreState;
  updateTree: (props?: ViewProps) => void;
  updateData: (data: Data) => void;
  updateMainId: (id: Datum['id']) => void;
  getMainId: () => Datum['id'];
  getData: () => Data;
  getTree: () => StoreState['tree'];
  setOnUpdate: (f: (props?: ViewProps) => void) => void;
  getMainDatum: () => Datum;
  getDatum: (id: Datum['id']) => Datum | undefined;
  getTreeMainDatum: () => TreeDatum;
  getTreeDatum: (id: Datum['id']) => TreeDatum | undefined;
  getLastAvailableMainDatum: () => Datum;
  methods: { [key: string]: (...args: any[]) => any };
}

export interface UpdateTreeProps {
  initial?: boolean;
  tree_position?: 'fit' | 'main_to_middle' | 'inherit';
  transition_time?: number;
}