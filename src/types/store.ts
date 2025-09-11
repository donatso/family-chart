import { Datum, Data } from './data';
import { TreeData, TreeDatum } from './treeData';
import { CalculateTreeOptions, Tree } from '../layout/calculate-tree';
import { ViewProps } from '../renderers/view';

export type TransitionTime = number;
export type SingleParentEmptyCardLabel = string;
export type UnknownCardLabel = string;
export type DuplicateBranchToggle = boolean;
export type LevelSeparation = number;
export type NodeSeparation = number;
export type PrivateCardsConfig = {
  condition: (d: Datum) => boolean;
};
export type ShowSiblingsOfMain = boolean;
export type ModifyTreeHierarchy = CalculateTreeOptions['modifyTreeHierarchy'];
export type SortChildrenFunction = ((a: Datum, b: Datum) => number);
export type SortSpousesFunction = ((d: Datum, data: Data) => void);
export type AncestryDepth = number;
export type ProgenyDepth = number;

export interface StoreState extends CalculateTreeOptions {
  data: Data;
  main_id: Datum['id'];
  main_id_history?: Datum['id'][];
  tree?: Tree;

  transition_time?: TransitionTime;
  single_parent_empty_card_label?: SingleParentEmptyCardLabel;
  unknown_card_label?: UnknownCardLabel;
  duplicate_branch_toggle?: DuplicateBranchToggle;
  level_separation?: LevelSeparation;
  node_separation?: NodeSeparation;
  private_cards_config?: PrivateCardsConfig;
  show_siblings_of_main?: ShowSiblingsOfMain;
  sortChildrenFunction?: SortChildrenFunction;
  sortSpousesFunction?: SortSpousesFunction;
  ancestry_depth?: AncestryDepth;
  progeny_depth?: ProgenyDepth;
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