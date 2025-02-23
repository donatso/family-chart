import type { HierarchyNode } from "d3"

export type TreePerson = {
    id: string
    is_ancestry?:boolean
    rels: Partial<{spouses: string[],father:string,mother:string,children:string[]}>,
    _rels?: Partial<{spouses: string[],father:string,mother:string,children:string[]}>
    data: Partial<{
        "first name": string
        "last name":string
        birthday: string
        avatar:string
        gender: 'M'|'F' | string
    }> & Partial<Record<string,string>>
    _new_rel_data?: {rel_type:string,label:string, other_parent_id?: string}
    main?:boolean
    to_add?:boolean
    hide_rels?:boolean
}
export type FamilyTreeNodePerson = {parents?: FamilyTreeNode[], spouses: FamilyTreeNode[], spouse: FamilyTreeNode,depth: number,is_ancestry?:boolean,x: number, y: number,added?:boolean,all_rels_displayed?:boolean,_x?: number, _y?: number, sx?: number, psx?: number,psy?: number, exiting: unknown}
export type HierarchyLikePerson= {data: TreePerson, depth: number} & Pretty
export type HierarchyPerson = HierarchyNode<TreePerson> | {data: TreePerson, depth: number}
type Pretty = {is_ancestry?: boolean, added?:unknown, x?: number, y?: number, sx?: number, sy?: number, psx?: number | undefined, psy?: number |undefined,spouse?: HierarchyPersonPretty,spouses?: HierarchyPersonPretty[]}
export type HierarchyPersonPretty = HierarchyPerson & Pretty & {parents?: HierarchyPersonPretty[]}

export type FamilyTreeNode = HierarchyNode<TreePerson>  & FamilyTreeNodePerson

export type Zoomable<T> = T & Partial<{__zoomObj: d3.ZoomBehavior<Element, unknown>,__zoom:unknown}>