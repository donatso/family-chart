import type { FamilyTree } from "../CalculateTree/CalculateTree";
import type { TreeLink } from "../CalculateTree/createLinks";

export function calculateDelay(tree: FamilyTree, d: {is_ancestry?:unknown,spouse?:unknown,depth: number }, transition_time: number) {
    const delay_level = transition_time*.4,
      ancestry_levels = Math.max(...tree.data.map(d=>d.is_ancestry ? d.depth : 0))
    let delay = d.depth*delay_level;
    if ((d.depth !== 0 || !!d.spouse) && !d.is_ancestry) {
      delay+=(ancestry_levels)*delay_level  // after ancestry
      if (d.spouse) delay+=delay_level  // spouse after bloodline
      delay+=(d.depth)*delay_level  // double the delay for each level because of additional spouse delay
    }
    return delay
  }