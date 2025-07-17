import { Datum } from './data';

export interface TreeDatum {
  data: Datum;
  x: number;
  y: number;
  depth: number;
  parent?: TreeDatum;  // d3 hierarchy parent

  tid?: string;  // tree node unique id

  _x?: number; // previous x position
  _y?: number; // previous y position
  sx?: number; // spouse x position
  sy?: number; // spouse y position
  psx?: number; // parent spouse x position
  psy?: number; // parent spouse y position

  exiting?: boolean; // is person card in transition out of tree? That happens when tree view is being changed.
  added?: boolean;

  all_rels_displayed?: boolean;  // are there relatives of this person that are not displayed in current tree view?

  children?: TreeDatum[];  // progeny will have this property if they have children
  parents?: TreeDatum[];  // main person and ancestors will have this property if there are more than one parent

  spouses?: TreeDatum[];  // spouses of this person, available only in progeny and main person
  spouse?: TreeDatum;  // if person is added to tree because if it is a spouse of progeny or main person will have this property
  coparent?: TreeDatum;  // all ancestry nodes will have this property as a way to connect to spouse

  duplicate?: number;  // if person is a duplicate of another person, this property will be set to the number of duplicates
  is_ancestry?: boolean;  // if person is an ancestor, this property will be set to true, if person is a progeny, it will not have this property
  sibling?: boolean;  // setShowSiblingsOfMain is true then main person siblings will be added and have this property
}

export type TreeData = TreeDatum[]; 