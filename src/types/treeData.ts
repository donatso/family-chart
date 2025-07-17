import { Datum } from './data';
import type { HierarchyNode } from 'd3-hierarchy';

export interface TreeDatum extends HierarchyNode<Datum> {
  [key: string]: any;
}

export type TreeData = TreeDatum[]; 