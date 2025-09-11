import { TreeDatum } from "../types/treeData";
import { Tree } from "../layout/calculate-tree";

export function isAllRelativeDisplayed(d: TreeDatum, data: TreeDatum[]) {
  const r = d.data.rels
  const all_rels = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(v => v)
  return all_rels.every(rel_id => data.some(d => d.data.id === rel_id))
}

export function calculateDelay(tree: Tree, d: {depth: number, is_ancestry?: boolean, spouse?: boolean} | TreeDatum, transition_time: number) {  // todo: view-handlers.js
  const delay_level = transition_time*.4
  const ancestry_levels = Math.max(...tree.data.map(d=>d.is_ancestry ? d.depth : 0))
  let delay = d.depth*delay_level;
  if ((d.depth !== 0 || !!d.spouse) && !d.is_ancestry) {
    delay+=(ancestry_levels)*delay_level  // after ancestry
    if (d.spouse) delay+=delay_level  // spouse after bloodline
    delay+=(d.depth)*delay_level  // double the delay for each level because of additional spouse delay
  }
  return delay
}