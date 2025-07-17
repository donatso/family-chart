import { Datum, Data } from './data';
import { TreeData, TreeDatum } from './treeData';
import { CalculateTreeOptions } from '../CalculateTree/CalculateTree';

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
}

export interface StoreState extends CalculateTreeOptions {}

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