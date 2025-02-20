import CalculateTree, { FamilyTree } from "./CalculateTree/CalculateTree.js"
import type { TreePerson } from "./types.js"

export type TreeStoreState = {
  tree:FamilyTree
  main_id:string
  node_separation:number
  level_separation:number
  single_parent_empty_card:boolean
  single_parent_empty_card_label: string
  is_horizontal:boolean
  main_id_history:unknown[]
  data:TreePerson[]

}
export class TreeStore {
  state: TreeStoreState
  onUpdate: ((props: unknown) => void) | undefined
  methods: {}
  setOnUpdate(f) {
    this.onUpdate = f
  }
  updateTree(props){
    this.state.tree = this.calcTree();
    if (!this.state.main_id) this.updateMainId(this.state.tree.main_id)
    if (this.onUpdate) this.onUpdate(props)
  }
  updateData(data) {
    this.state.data = data
  }
  getMainId() {
    return this.state.main_id
  }
  getData(){
    return this.state.data
  }
  getTree() {
   return this.state.tree
  }
  calcTree() {
    return CalculateTree({
      data: this.state.data, main_id: this.state.main_id,
      node_separation: this.state.node_separation, level_separation: this.state.level_separation,
      single_parent_empty_card: this.state.single_parent_empty_card,
      is_horizontal: this.state.is_horizontal
    })
  }
  getMainDatum() {
    return this.state.data.find(d => d.id === this.state.main_id)
  }
  getDatum(id) {
    return this.state.data.find(d => d.id === id)
  }
  getTreeMainDatum() {
    if (!this.state.tree) return null;
    return this.state.tree.data.find(d => d.data.id === this.state.main_id)
  }
  getTreeDatum(id) {
    if (!this.state.tree) return null;
    return this.state.tree.data.find(d => d.id === id)
  }
  updateMainId(id) {
    if (id === this.state.main_id) return
   this.state.main_id_history = this.state.main_id_history.filter(d => d !== id).slice(-10)
    this.state.main_id_history.push(id)
    this.state.main_id = id
  }
  // if main_id is deleted, get the last available main_id
  getLastAvailableMainDatum() {
    let main_id = this.state.main_id_history.slice(0).reverse().find(id => this.getDatum(id))
    if (!main_id) main_id = this.state.data[0]?.id
    if (main_id !== this.state.main_id) this.updateMainId(main_id)
    return this.getDatum(main_id)
  }

  constructor(initial_state){
    this.state = initial_state
    this.state.main_id_history = []
    this.methods = {}
  }
}
export default function createStore(initial_state) {
  return new TreeStore(initial_state)
}