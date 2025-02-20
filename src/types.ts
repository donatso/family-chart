import type { HierarchyNode } from "d3"

export type TreePerson = {
    id: string
    is_ancestry?:boolean
    rels: Partial<{spouses: string[],father:string,mother:string,children:string[]}>
    data: {
        "first name": string
        "last name":string
        birthday: string
        avatar:string
        gender: 'M'|'F' | string
    } & Partial<Record<string,string>>
    _new_rel_data: {rel_type:string,label:string, other_parent_id: unknown}
    main?:boolean
    to_add?:boolean
}
export type FamilyTreeNodePerson = {parents?: FamilyTreeNode[], spouses: unknown[], spouse: unknown,depth: unknown,is_ancestry?:boolean,x: number, y: number,all_rels_displayed?:boolean,_x: number, _y: number}
export type FamilyTreeNode = HierarchyNode<TreePerson>  & FamilyTreeNodePerson

export type Zoomable<T> = T & Partial<{__zoomObj: d3.ZoomBehavior<Element, unknown>,__zoom:unknown}>