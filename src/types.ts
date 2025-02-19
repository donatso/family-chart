export type TreePerson = {
    id: string
    rels: {spouses: string[],father:string,mother:string,children:string[]}
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