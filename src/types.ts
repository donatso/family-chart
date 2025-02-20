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
    }
}
const a: TreePerson = {} as TreePerson
a.data["first name"]

export type FamilyTreeNode = HierarchyNode<TreePerson>  & {parents?: FamilyTreeNode[],is_ancestry?:boolean,x?: number, y?: number,all_rels_displayed?:boolean}

export type Zoomable<T> = T & Partial<{__zoomObj: d3.ZoomBehavior<Element, unknown>,__zoom:unknown}>