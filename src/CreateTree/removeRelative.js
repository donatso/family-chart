export default (...args) => { return new RemoveRelative(...args) }

function RemoveRelative(store, onActivate, cancelCallback) {
  this.store = store

  this.onActivate = onActivate
  this.cancelCallback = cancelCallback

  this.datum = null

  this.onChange = null
  this.onCancel = null

  this.is_active = false

  return this
}

RemoveRelative.prototype.activate = function(datum) {
  if (this.is_active) this.onCancel()
  this.onActivate()
  this.is_active = true
  this.store.state.one_level_rels = true

  const store = this.store

  this.datum = datum

  store.updateTree({})

  this.onChange = onChange.bind(this)
  this.onCancel = onCancel.bind(this)

  function onChange(rel_tree_datum) {
    const rel_type = findRelType(rel_tree_datum)

    const rels = datum.rels
    if (rel_type === 'father') {
      const father = store.getDatum(rels.father)
      father.rels.children = father.rels.children.filter(id => id !== datum.id)
      rels.father = null
    }
    else if (rel_type === 'mother') {
      const mother = store.getDatum(rels.mother)
      mother.rels.children = mother.rels.children.filter(id => id !== datum.id)
      rels.mother = null
    }
    else if (rel_type === 'spouse') {
      rel_tree_datum.data.rels.spouses = rel_tree_datum.data.rels.spouses.filter(id => id !== datum.id)
      rels.spouses = rels.spouses.filter(id => id !== rel_tree_datum.data.id);
      (rels.children || []).forEach(id => {
        const child = store.getDatum(id)
        if (child.rels.father === rel_tree_datum.data.id) child.rels.father = null
        if (child.rels.mother === rel_tree_datum.data.id) child.rels.mother = null
      })
      if (rel_tree_datum.data.rels.children) {
        rel_tree_datum.data.rels.children = rel_tree_datum.data.rels.children.filter(ch_id => !(rels.children || []).includes(ch_id))
      }
    }
    else if (rel_type === 'children') {
      rels.children = rels.children.filter(id => id !== rel_tree_datum.data.id)
      const datum_rel_type = rel_tree_datum.data.rels.father === datum.id ? 'father' : 'mother'
      rel_tree_datum.data.rels[datum_rel_type] = null
    }

    function findRelType(d) {
      if (d.is_ancestry) {
        if (datum.rels.father === d.data.id) return 'father'
        if (datum.rels.mother === d.data.id) return 'mother'
      } 
      else if (d.spouse) {
        if (datum.rels.spouses.includes(d.data.id)) return 'spouse'
      }
      else {
        if (datum.rels.children.includes(d.data.id)) return 'children'
      }
      return null
    }
  }

  function onCancel() {
    if (!this.is_active) return
    this.is_active = false
    this.store.state.one_level_rels = false

    this.cancelCallback(this.datum)

    this.datum = null
    this.onChange = null
    this.onCancel = null
  }

}