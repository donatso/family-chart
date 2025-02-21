import * as d3 from 'd3';
import {sortChildrenWithSpouses} from "./CalculateTree.handlers.ts"
import {createNewPerson} from "../CreateTree/newPerson.js"
import {isAllRelativeDisplayed} from "../handlers/general.js"
import type { FamilyTreeNode, FamilyTreeNodePerson, HierarchyLikePerson, HierarchyPerson, HierarchyPersonPretty, TreePerson } from '../types.ts';

export default function CalculateTree(args: {data: TreePerson[],main_id?: null | string, node_separation?: number,level_separation?: number,single_parent_empty_card?: boolean,is_horizontal?:boolean}) {
  return new FamilyTree(args)
}

export class FamilyTree {
  data: FamilyTreeNode[]
  data_stash: TreePerson[]
  dim:  {width:number,height:number,x_off: number, y_off:number}
  main_id: string | null
  is_horizontal:boolean | undefined
  node_separation:number
  level_separation:number
  constructor({data, main_id=null, node_separation=250, level_separation=150, single_parent_empty_card=true, is_horizontal=false}: {data: TreePerson[],main_id?: null | string, node_separation?: number,level_separation?: number,single_parent_empty_card?: boolean,is_horizontal?:boolean}){
    this.node_separation=node_separation
    this.level_separation=level_separation
    if(!data || !data.length){
      this.data = []
      this.data_stash=[]
      this.dim ={width: 0, height: 0, x_off:0,y_off:0}
      this.main_id = null
      return this
    }
    
    if (is_horizontal) [node_separation, level_separation] = [level_separation, node_separation]
    const data_stash = single_parent_empty_card ? this.createRelsToAdd(data) : data
    sortChildrenWithSpouses(data_stash)
    const main = (main_id !== null && data_stash.find(d => d.id === main_id))! || data_stash[0]!
    const tree_children = this.calculateTreePositions(main, 'children', false)
    const tree_parents = this.calculateTreePositions(main, 'parents', true)
  
    data_stash.forEach(d => d.main = d === main)
    this.levelOutEachSide(tree_parents, tree_children)
    const tree = this.mergeSides(tree_parents, tree_children)
    this.setupChildrenAndParents({tree})
    this.setupSpouses({tree, node_separation})
    this.setupProgenyParentsPos({tree})
    this.nodePositioning({tree})
    tree.forEach(d => d.all_rels_displayed = isAllRelativeDisplayed(d, tree))
  
    const dim = this.calculateTreeDim(tree, node_separation, level_separation)
  
   this.data= tree, 
   this.data_stash=data_stash, 
   this.dim =dim, 
   this.main_id= main.id 
   this.is_horizontal =  is_horizontal
  
  }
  calculateTreePositions(datum: TreePerson, rt: string, is_ancestry:boolean): FamilyTreeNode[] {
    const hierarchyGetterChildren = (d: TreePerson) =>  {
      return [...(d.rels.children || [])].map(id => this.data_stash.find(d => d.id === id)!)
    }
    const hierarchyGetterParents = (d: TreePerson) =>  {
      return [d.rels.father, d.rels.mother]
        .filter(d => d).map(id => this.data_stash.find(d => d.id === id)!)
    }
    const hierarchyGetter = rt === "children" ? hierarchyGetterChildren : hierarchyGetterParents,
      d3_tree = d3.tree<TreePerson>().nodeSize([this.node_separation, this.level_separation]).separation(separation),
      root = d3.hierarchy<TreePerson>(datum, hierarchyGetter);
    d3_tree(root);
    return root.descendants() as FamilyTreeNode[]

    function separation(a: d3.HierarchyNode<TreePerson>, b: d3.HierarchyNode<TreePerson>) {
      let offset = 1;
      if (!is_ancestry) {
        if (!sameParent(a, b)) offset+=.25
        if (someSpouses(a,b)) offset+=offsetOnPartners(a,b)
        if (sameParent(a, b) && !sameBothParents(a,b)) offset+=.125
      }
      return offset
    }

    function hasCh(d: d3.HierarchyNode<TreePerson>) {return !!d.children}
    function sameParent(a: d3.HierarchyNode<TreePerson>, b:d3.HierarchyNode<TreePerson>) {return a.parent == b.parent}
    function sameBothParents(a:HierarchyPerson, b: HierarchyPerson) {return (a.data.rels.father === b.data.rels.father) && (a.data.rels.mother === b.data.rels.mother)}
    function someChildren(a: d3.HierarchyNode<TreePerson>, b: d3.HierarchyNode<TreePerson>) {return hasCh(a) || hasCh(b)}
    function hasSpouses(d: HierarchyPerson) {return d.data.rels.spouses && d.data.rels.spouses.length > 0}
    function someSpouses(a: HierarchyPerson, b: HierarchyPerson) {return hasSpouses(a) || hasSpouses(b)}

    

   

    function offsetOnPartners(a: {data: TreePerson},b: {data: TreePerson}) {
      return ((a.data.rels.spouses || []).length + (b.data.rels.spouses || []).length)*.5
    }
  }

  levelOutEachSide(parents: {x?: number}[], children: {x?: number}[]) {
    const mid_diff = ((parents[0]?.x ?? 0) - (children[0]!.x ?? 0)) / 2
    parents.forEach(d => d.x=(d.x ?? 0) -mid_diff)
    children.forEach(d => d.x=(d.x ?? 0) +mid_diff)
  }

  mergeSides(parents:FamilyTreeNode[] , children: FamilyTreeNode[]) {
    parents.forEach(d => {d.is_ancestry = true})
    parents.forEach(d => d.depth === 1 ? d.parent = children[0] ?? null : null)

    return [...children, ...parents.slice(1)];
  }
  nodePositioning({tree }:  {tree: HierarchyPersonPretty[]}) {
    tree.forEach(d => {
      d.y= (d.y ?? 1)*  (d.data.is_ancestry ? -1 : 1)
      if (this.is_horizontal) {
        const d_x = d.x; d.x = d.y; d.y = d_x
      }
    })
  }

   setupSpouses({tree, node_separation}: {tree: HierarchyPersonPretty[],node_separation: number}) {
    for (let i = tree.length; i--;) {
      const d = tree[i]!
      if (!d.is_ancestry && d.data.rels.spouses && d.data.rels.spouses.length > 0){
        const side = d.data.data.gender === "M" ? -1 : 1;  // female on right
        d.x = (d.x ?? 0) + d.data.rels.spouses.length/2*node_separation*side;
        d.data.rels.spouses.forEach((sp_id:string, i: number) => {
          const spouse = {data: this.data_stash.find(d0 => d0.id === sp_id)!, added: true, x: d.x!-(node_separation*(i+1))*side, y: d.y!} as HierarchyLikePerson
          spouse.sx = i > 0 ? spouse.x! : spouse.x! + (node_separation/2)*side
          spouse.sy = i > 0 ? spouse.y! : spouse.y! + (node_separation/2)*side
          spouse.depth =  d.depth;
          spouse.spouse = d;
          if (!d.spouses) d.spouses = []
          d.spouses.push(spouse)
          tree.push(spouse)
        })
      }
      if (d.parents && d.parents.length === 2) {
        const p1 = d.parents[0]!,
          p2 = d.parents[1]!,
          midd = p1.x! - (p1.x! - p2.x!)/2,
          x = (d: HierarchyPersonPretty,sp: HierarchyPersonPretty) => midd + (node_separation/2)*(d.x! < sp.x! ? 1 : -1)

        p2.x = x(p1, p2); p1.x = x(p2, p1)
      }
    }
  }

  setupProgenyParentsPos({tree}: {tree: HierarchyPersonPretty[]}) {
    const setupParentPos = (d: {psx?: number,psy?:number}, p: {sx?: number,y?: number}) => {
      d.psx = !this.is_horizontal ? p.sx : p.y
      d.psy = !this.is_horizontal ? p.y : p.sx
    }
    tree.forEach(d => {
      if (d.is_ancestry) return
      if (d.depth === 0) return
      if (d.added) return
      const m = findDatum(d.data.rels.mother)
      const f = findDatum(d.data.rels.father)
      if (m && f) {
        if (!m.added && !f.added) console.error('no added spouse', m, f)
        const added_spouse = m.added ? m : f
        setupParentPos(d, added_spouse)
      } else if (m || f) {
        const parent = (m || f)!
        parent.sx = parent.x
        parent.sy = parent.y
        setupParentPos(d, parent)
      }

      
    })

    function findDatum(id: string | undefined) {
      if (!id) return null
      return tree.find(d => d.data.id === id)
    }
  }

  setupChildrenAndParents({tree}:  {tree: (d3.HierarchyNode<TreePerson> & {is_ancestry?: unknown, parents?: unknown[]})[]}) {
    tree.forEach(d0 => {
      delete d0.children
      tree.forEach(d1 => {
        if (d1.parent === d0) {
          if (d1.is_ancestry) {
            if (!d0.parents) d0.parents = []
            d0.parents?.push(d1)
          } else {
            if (!d0.children) d0.children = []
            d0.children.push(d1)
          }
        }
      })
    })
  }

  calculateTreeDim(tree: (d3.HierarchyNode<TreePerson> & {x: number, y: number})[], node_separation: number, level_separation: number) {
    if (this.is_horizontal) [node_separation, level_separation] = [level_separation, node_separation]
    const w_extent = d3.extent(tree, (d) => d.x) as  [number,number]
    const h_extent= d3.extent(tree, (d) => d.y) as  [number,number]
    return {
      width: w_extent[1] - w_extent[0]+node_separation, height: h_extent[1] - h_extent[0]+level_separation, x_off: -w_extent[0]+node_separation/2, y_off: -h_extent[0]+level_separation/2
    }
  }

  createRelsToAdd<Datum extends Pick<TreePerson,'rels' | 'data' | 'id'>[]>(data: Datum) {
    const to_add_spouses : (ReturnType<typeof createNewPerson>)[] = [];
    for (let i = 0; i < data.length; i++) {
      const d = data[i]!;
      if (d.rels.children && d.rels.children.length > 0) {
        if (!d.rels.spouses) d.rels.spouses = []
        const is_father = d.data.gender === "M"
        let spouse: ReturnType<typeof createNewPerson>

        d.rels.children.forEach(d0 => {
          const child = data.find(d1 => d1.id === d0)!
          if (child.rels[is_father ? 'father' : 'mother'] !== d.id) return
          if (child.rels[!is_father ? 'father' : 'mother']) return
          if (!spouse) {
            spouse = createToAddSpouse(d)
            d.rels.spouses?.push(spouse.id)
          }
          spouse.rels.children?.push(child.id)
          child.rels[!is_father ? 'father' : 'mother'] = spouse.id
        })
      }
    }
    to_add_spouses.forEach(d => data.push(d as typeof data[number]))
    return data

    function createToAddSpouse(d: {id: string,data: {gender?: string}}) {
      const spouse = createNewPerson({
        data: {gender: d.data.gender === "M" ? "F" : "M"},
        rels: {spouses: [d.id], children: []},
        to_add: true
      });
      to_add_spouses.push(spouse);
      return spouse
    }
  }

}