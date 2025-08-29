import { Datum } from './data';

/**
 * Represents a node in the family tree.
 */
export interface TreeDatum {
  /** The underlying data for this node. */
  data: Datum;

  /** X position in the tree layout. */
  x: number;

  /** Y position in the tree layout. */
  y: number;

  /** Depth of the node in the tree. */
  depth: number;

  /** Reference to the parent node (d3 hierarchy parent). */
  parent?: TreeDatum;

  /** Unique tree node ID. */
  tid?: string;

  /** Previous X position (for transitions/animations). */
  _x?: number;

  /** Previous Y position (for transitions/animations). */
  _y?: number;

  /** Spouse X position. */
  sx?: number;

  /** Spouse Y position. */
  sy?: number;

  /** Parent spouse X position. */
  psx?: number;

  /** Parent spouse Y position. */
  psy?: number;

  /** True if the card is transitioning out of the tree (e.g., during view change). */
  exiting?: boolean;

  /** True if the node was just added. */
  added?: boolean;

  /** True if not all relatives of this person are displayed in the current tree view. */
  all_rels_displayed?: boolean;

  /** Children of this node (main person and progeny). */
  children?: TreeDatum[];

  /** Parents of this node (main person and ancestry). */
  parents?: TreeDatum[];

  /** Spouses of this person (progeny and main person only). */
  spouses?: TreeDatum[];

  /** If this person is added as a spouse of progeny or main person, this property is set. */
  spouse?: TreeDatum;

  /** For ancestry nodes, connects to spouse. */
  coparent?: TreeDatum;

  /** If this person is a duplicate, this is the number of duplicates. */
  duplicate?: number;

  /** True if this person is an ancestor. */
  is_ancestry?: boolean;

  /** True if this node is a sibling (setShowSiblingsOfMain is true). */
  sibling?: boolean;

  /** True if this card is private and should be treated differently. */
  is_private?: boolean;

  /** if we want to modify hierarchy of the tree, we can omit displaying some spouses */
  _ignore_spouses?: Datum['id'][]

  /** Reference to the DOM node for this tree datum. (for debugging) */
  __node?: HTMLElement;

  /** Reference to the label for this tree datum. (for debugging) */
  __label?: string;
}

/** An array of tree nodes. */
export type TreeData = TreeDatum[];