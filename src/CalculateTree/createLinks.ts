import type { BaseType, HierarchyNode, Selection } from "d3";
import type { FamilyTreeNode, TreePerson } from "../types";

export type TreeLink = {d:[number,number][],_d:() => [number,number][],curve:boolean,id: string,depth: number,spouse?:unknown,is_ancestry:boolean,source:FamilyTreeNode[] | FamilyTreeNode,target: FamilyTreeNode[] |FamilyTreeNode }
class TreeLinks {
  links: TreeLink[]
  tree: FamilyTreeNode[]
  is_horizontal:boolean
  constructor({d, tree, is_horizontal=false}: {d: FamilyTreeNode,tree: FamilyTreeNode[],is_horizontal?:boolean}){
    this.links = []
    this.tree = tree
    this.is_horizontal=is_horizontal
    if (d.data.rels.spouses && d.data.rels.spouses.length > 0) this.handleSpouse({d})
      this.handleAncestrySide({d})
      this.handleProgenySide({d})
  }
  handleAncestrySide({d}: {d:FamilyTreeNode }) {
    if (!d.parents) return
    const p1 = d.parents[0]!
    const p2 = d.parents[1] || p1

    const p = {x: this.getMid(p1, p2, 'x'), y: this.getMid(p1, p2, 'y')}

    this.links.push({
      d: this.Link(d, p),
      _d: () => {
        const _d = {x: d.x, y: d.y},
          _p = {x: d.x, y: d.y}
        return this.Link(_d, _p)
      },
      curve: true, 
      id: this.linkId(d, p1, p2), 
      depth: d.depth+1, 
      is_ancestry: true,
      source: d,
      target: [p1!, p2!]
    })
  }

  handleProgenySide({d}: {d: FamilyTreeNode}) {
    if (!d.children || d.children.length === 0) return

    d.children.forEach((child) => {
      const other_parent = this.otherParent(child, d, this.tree) || d
      const sx = other_parent.sx!

      const parent_pos = !this.is_horizontal ? {x: sx, y: d.y} : {x: d.x, y: sx}
      this.links.push({
        d: this.Link(child, parent_pos),
        _d: () => this.Link(parent_pos, {x:this._or(parent_pos, 'x'), y: this._or(parent_pos, 'y')}),
        curve: true,
        id: this.linkId(child, d, other_parent),
        depth: d.depth+1,
        is_ancestry: false,
        source: [d, other_parent],
        target: child
      })
    })
  }

  handleSpouse({d} : {d: FamilyTreeNode}) {
    d.data.rels.spouses?.forEach(sp_id => {
      const spouse = this.getRel(d, this.tree, d0 => d0.data.id === sp_id)
      if (!spouse || d.spouse) return
      this.links.push({
        d: [[d.x, d.y], [spouse.x, spouse.y]],
        _d: () => [
          d.is_ancestry ? [this._or(d, 'x')-.0001, this._or(d, 'y')] : [d.x, d.y], // add -.0001 to line to have some length if d.x === spouse.x
          d.is_ancestry ? [this._or(spouse, 'x'), this._or(spouse, 'y')] : [d.x-.0001, d.y]
        ],
        curve: false, 
        id: this.linkId(d, spouse), 
        depth: d.depth, 
        spouse: true, 
        is_ancestry: !!spouse.is_ancestry, 
        source: d, 
        target: spouse
      })
    })
  }
  ///
  getMid<K extends string>(d1:Partial<Record<K | `_${K}`,number>> , d2: Partial<Record<K | `_${K}`,number>>, side: K, is_?:unknown) {
    if (is_) return this._or(d1, side) - (this._or(d1, side) - this._or(d2, side))/2
    else return d1[side]! - (d1[side]! - d2[side]!)/2
  }

  _or<K extends string >(d: Partial<Record<K | `_${K}`,number>>, k: K): number {
   const underscore = `_${k}` as const
   return (d.hasOwnProperty(underscore) ? d[underscore]! : d[k]!) 
  }

  Link(d: {x: number, y:number}, p: {x: number, y: number}) {
    return this.is_horizontal ? this.LinkHorizontal(d, p) : this.LinkVertical(d, p)
  }

  LinkVertical(d: {x: number, y:number}, p: {x: number, y: number}): [number,number][] {
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

  LinkHorizontal(d: {x: number, y:number}, p: {x: number, y: number}): [number,number][] {
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

  linkId(...args: {data: {id: string}}[]) {
    return args.map(d => d.data.id).sort().join(", ")  // make unique id
  }

  otherParent(child: FamilyTreeNode, p1: FamilyTreeNode, data: FamilyTreeNode[]) {
    const condition = (d0: {data: {id: unknown}}) => (d0.data.id !== p1.data.id) && ((d0.data.id === child.data.rels.mother) || (d0.data.id === child.data.rels.father))
    return this.getRel(p1, data, condition)
  }

  // if there is overlapping of personas in different branches of same family tree, return the closest one
  getRel<Datum extends {x: number, y: number}>(d: {x:number, y:number}, data: Datum[], condition: (datum: NoInfer<Datum>) =>boolean) {
    const rels = data.filter(condition)
    const dist_xy = (a: {x:number,y:number}, b: {x: number, y:number}) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
    if (rels.length > 1) return rels.sort((d0, d1) => dist_xy(d0, d) - dist_xy(d1, d))[0]
    else return rels[0]
  }
}
export function createLinks({d, tree, is_horizontal=false}: {d: FamilyTreeNode,tree: FamilyTreeNode[],is_horizontal?:boolean}) {
  return new TreeLinks({d,tree,is_horizontal}).links
}

export function pathToMain(cards: Selection<BaseType,FamilyTreeNode,BaseType,unknown>, links:d3.Selection<BaseType,TreeLink,BaseType,unknown>, datum: FamilyTreeNode, main_datum: FamilyTreeNode) {
  const is_ancestry = datum.is_ancestry
  const links_data = links.data()
  let links_node_to_main: {link:TreeLink,node: BaseType}[] = []
  let cards_node_to_main: {card: FamilyTreeNode,node: BaseType}[] = []

  if (is_ancestry) {
    const links_to_main: TreeLink[] = []

    let parent = datum
    let itteration1 = 0
    while (parent !== main_datum && itteration1 < 100) {
      itteration1++  // to prevent infinite loop
      const spouse_link = links_data.find(d => d.spouse === true && ((!Array.isArray(d.source) && d.source === parent) || (d.target) === parent))
      if (spouse_link) {
        const child_link = links_data.find(d => Array.isArray(d.target) && d.target.includes(spouse_link.source as FamilyTreeNode) && d.target.includes(spouse_link.target as FamilyTreeNode))
        if (!child_link) break
        links_to_main.push(spouse_link)
        links_to_main.push(child_link)
        parent = child_link.source as FamilyTreeNode
      } else {
        // single parent
        const child_link = links_data.find(d => Array.isArray(d.target) && d.target.includes(parent))
        if (!child_link) break
        links_to_main.push(child_link)
        parent = child_link.source as FamilyTreeNode
      }
    }
    links.each(function(d) {
      if (links_to_main.includes(d)) {
        links_node_to_main.push({link: d, node: this})
      }
    })

    const cards_to_main = getCardsToMain(datum, links_to_main)
    cards.each(function(d) {
      if (cards_to_main.includes(d)) {
        cards_node_to_main.push({card: d, node: this})
      }
    })
  } else if (datum.spouse && datum.spouse.data === main_datum.data) {
    links.each(function(d) {
      if (d.target === datum) links_node_to_main.push({link: d, node: this})
    })
    const cards_to_main = [main_datum, datum]
    cards.each(function(d) {
      if (cards_to_main.includes(d)) {
        cards_node_to_main.push({card: d, node: this})
      }
    })
  } else {
    let links_to_main: TreeLink[] = []

    let child = datum
    let itteration1 = 0
    while (child !== main_datum && itteration1 < 100) {
      itteration1++  // to prevent infinite loop
      const child_link = links_data.find(d => d.target === child && Array.isArray(d.source))
      if (child_link) {
        const spouse_link = links_data.find(d => d.spouse === true && sameArray([d.source, d.target], child_link.source as FamilyTreeNode[]))
        links_to_main.push(child_link)
        if(spouse_link){
          links_to_main.push(spouse_link)
        }
      
        if (spouse_link) child = spouse_link.source as FamilyTreeNode
        else child = (child_link.source as FamilyTreeNode[])[0]!
      } else {
        const spouse_link = links_data.find(d => d.target === child && !Array.isArray(d.source))  // spouse link
        if (!spouse_link) break
        links_to_main.push(spouse_link)
        child = spouse_link.source as FamilyTreeNode
      }
    }

    links.each(function(d) {
      if (links_to_main.includes(d)) {
        links_node_to_main.push({link: d, node: this})
      }
    })

    const cards_to_main = getCardsToMain(main_datum, links_to_main)
    cards.each(function(d) {
      if (cards_to_main.includes(d)) {
        cards_node_to_main.push({card: d, node: this})
      }
    })
  }
  return [cards_node_to_main, links_node_to_main] as const

  function sameArray<T>(arr1: T[], arr2:T[]) {
    return arr1.every(d1 => arr2.some(d2 => d1 === d2))
  }

  function getCardsToMain(first_parent: FamilyTreeNode, links_to_main: TreeLink[]) {
    const all_cards = links_to_main.filter(d => d).reduce((acc, d) => {
      if (Array.isArray(d.target)) acc.push(...d.target)
      else acc.push(d.target)
      if (Array.isArray(d.source)) acc.push(...d.source)
      else acc.push(d.source)
      return acc
    }, [] as FamilyTreeNode[])

    const cards_to_main = [main_datum, datum]
    getChildren(first_parent)
    return cards_to_main

    function getChildren(d: FamilyTreeNode) {
      if (d.data.rels.children) {
        d.data.rels.children.forEach(child_id => {
          const child = all_cards.find(d0 => d0.data.id === child_id)
          if (child) {
            cards_to_main.push(child)
            getChildren(child)
          }
        })
      }
    }
  }
}



