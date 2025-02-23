import * as d3 from 'd3';
import type { FamilyTreeNode, Zoomable } from '../types';

export function manualZoom({amount, svg, transition_time=500}: {amount: number,svg: SVGElement & {__zoomObj: d3.ZoomBehavior<Element, unknown>} ,transition_time?: number}) {
  const zoom = svg.__zoomObj
  d3.select(svg).transition().duration(transition_time || 0).delay(transition_time ? 100 : 0)  // delay 100 because of weird error of undefined something in d3 zoom
    .call(zoom.scaleBy as any, amount)
}

export function isAllRelativeDisplayed(d: FamilyTreeNode, data: FamilyTreeNode[]) {
  const r = d.data.rels,
    all_rels = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(v => v)
  return all_rels.every(rel_id => data.some(d => d.data.id === rel_id))
}