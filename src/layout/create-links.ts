import { TreeDatum } from "../types/treeData"
import { Tree } from "./calculate-tree"

export interface Link {
  d: [number, number][]
  _d: () => [number, number][]
  curve: boolean
  id: string
  depth: number
  is_ancestry: boolean | undefined
  source: TreeDatum | TreeDatum[]
  target: TreeDatum | TreeDatum[]
  spouse?: boolean
}

type LinkPoint = {x: number, y: number, _x?: number, _y?: number}

export function createLinks(d: TreeDatum, is_horizontal: boolean = false) {
  const links: Link[] = [];
  // d.spouses is always added to non-ancestry side for main blodline nodes
  // d.coparent is added to ancestry side
  if (d.spouses || d.coparent) handleSpouse(d)
  handleAncestrySide(d)
  handleProgenySide(d)

  return links;

  function handleAncestrySide(d: TreeDatum) {
    if (!d.parents) return
    const p1 = d.parents[0]
    const p2 = d.parents[1] || p1

    const p = {x: getMid(p1, p2, 'x'), y: getMid(p1, p2, 'y')}

    links.push({
      d: Link(d, p),
      _d: () => {
        const _d = {x: d.x, y: d.y},
          _p = {x: d.x, y: d.y}
        return Link(_d, _p)
      },
      curve: true, 
      id: linkId(d, p1, p2), 
      depth: d.depth+1, 
      is_ancestry: true,
      source: d,
      target: [p1, p2]
    })
  }


  function handleProgenySide(d: TreeDatum) {
    if (!d.children || d.children.length === 0) return

    d.children.forEach((child, i) => {
      const other_parent = otherParent(child, d) || d
      const sx = other_parent.sx
      if (typeof sx !== 'number') throw new Error('sx is not a number')

      const parent_pos: LinkPoint = !is_horizontal ? {x: sx, y: d.y} : {x: d.x, y: sx}
      links.push({
        d: Link(child, parent_pos),
        _d: () => Link(parent_pos, {x: _or(parent_pos, 'x'), y: _or(parent_pos, 'y')}),
        curve: true,
        id: linkId(child, d, other_parent),
        depth: d.depth+1,
        is_ancestry: false,
        source: [d, other_parent],
        target: child
      })
    })
  }


  function handleSpouse(d: TreeDatum) {
    if (d.spouses) {
      d.spouses.forEach(spouse => links.push(createSpouseLink(d, spouse)))
    } else if (d.coparent) {
      links.push(createSpouseLink(d, d.coparent))
    }

    function createSpouseLink(d: TreeDatum, spouse: TreeDatum): Link {
      return {
        d: [[d.x, d.y], [spouse.x, spouse.y]],
        _d: () => [
          d.is_ancestry ? [_or(d, 'x')-.0001, _or(d, 'y')] : [d.x, d.y], // add -.0001 to line to have some length if d.x === spouse.x
          d.is_ancestry ? [_or(spouse, 'x'), _or(spouse, 'y')] : [d.x-.0001, d.y]
        ],
        curve: false, 
        id: linkId(d, spouse), 
        depth: d.depth, 
        spouse: true, 
        is_ancestry: spouse.is_ancestry, 
        source: d, 
        target: spouse
      }
    }
  }

  ///
  function getMid(d1: LinkPoint, d2: LinkPoint, side: 'x' | 'y', is_: boolean = false) {
    if (is_) return _or(d1, side) - (_or(d1, side) - _or(d2, side))/2
    else return d1[side] - (d1[side] - d2[side])/2
  }

  function _or(d: LinkPoint, side: 'x' | 'y') {
    const n = d.hasOwnProperty(`_${side}`) ? d[`_${side}`] : d[side]
    if (typeof n !== 'number') throw new Error(`${side} is not a number`)
    return n
  }

  function Link(d: LinkPoint, p: LinkPoint): [number, number][] {
    return is_horizontal ? LinkHorizontal(d, p) : LinkVertical(d, p)
  }

  function LinkVertical(d: LinkPoint, p: LinkPoint): [number, number][] {
    const hy = (d.y + (p.y - d.y) / 2)
    return [
      [d.x, d.y],
      [d.x, hy],
      [d.x, hy],
      [p.x, hy],
      [p.x, hy],
      [p.x, p.y],
    ]
  }

  function LinkHorizontal(d: LinkPoint, p: LinkPoint): [number, number][] {
    const hx = (d.x + (p.x - d.x) / 2)
    return [
      [d.x, d.y],
      [hx, d.y],
      [hx, d.y],
      [hx, p.y],
      [hx, p.y],
      [p.x, p.y],
    ]
  }

  function linkId(...args: TreeDatum[]) {
    return args.map(d => d.tid).sort().join(", ")  // make unique id
  }

  function otherParent(child: TreeDatum, p1: TreeDatum) {
    const p2 = (p1.spouses || []).find(d => d.data.id === child.data.rels.mother || d.data.id === child.data.rels.father)
    return p2
  }
}



