import d3 from '../d3.js'

export default (...args) => { return new RemoveRelative(...args) }

function RemoveRelative(store, onActivate, cancelCallback, modal) {
  this.store = store

  this.onActivate = onActivate
  this.cancelCallback = cancelCallback
  this.modal = modal

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

  function onChange(rel_tree_datum, onAccept) {
    const rel_type = findRelType(rel_tree_datum)

    const rels = datum.rels
    if (rel_type === 'father') handleFatherRemoval.call(this)
    else if (rel_type === 'mother') handleMotherRemoval.call(this)
    else if (rel_type === 'spouse') handleSpouseRemoval.call(this)
    else if (rel_type === 'children') handleChildrenRemoval.call(this)

    function handleFatherRemoval() {
      const father = store.getDatum(rels.father)
      father.rels.children = father.rels.children.filter(id => id !== datum.id)
      rels.father = null
      onAccept()
    }

    function handleMotherRemoval() {
      const mother = store.getDatum(rels.mother)
      mother.rels.children = mother.rels.children.filter(id => id !== datum.id)
      rels.mother = null
      onAccept()
    }

    function handleSpouseRemoval() {
      const spouse = rel_tree_datum.data
      if (checkIfChildrenWithSpouse()) openModal.call(this)
      else remove.call(this, true)
      
      function checkIfChildrenWithSpouse() {
        const children = spouse.rels.children || []
        return children.some(ch_id => {
          const child = store.getDatum(ch_id)
          if (child.rels.father === spouse.id) return true
          if (child.rels.mother === spouse.id) return true
          return false
        })
      }

      function openModal() {
        const current_gender_class = datum.data.gender === 'M' ? 'f3-male-bg' : datum.data.gender === 'F' ? 'f3-female-bg' : null
        const spouse_gender_class = spouse.data.gender === 'M' ? 'f3-male-bg' : spouse.data.gender === 'F' ? 'f3-female-bg' : null
  
        const div = d3.create('div').html(`
          <p>You are removing a spouse relationship. Since there are shared children, please choose which parent should keep them in the family tree.</p>
          <div class="f3-modal-options">
            <button data-option="assign-to-current" class="f3-btn ${current_gender_class}">Keep children with current person</button>
            <button data-option="assign-to-spouse" class="f3-btn ${spouse_gender_class}">Keep children with spouse</button>
          </div>
        `)
  
        div.selectAll('[data-option="assign-to-current"]').on('click', () => {
          remove(true)
          this.modal.close()
        })
  
        div.selectAll('[data-option="assign-to-spouse"]').on('click', () => {
          remove(false)
          this.modal.close()
        })
  
        this.modal.activate(div.node())
      }
      
      function remove(to_current) {
        rel_tree_datum.data.rels.spouses = rel_tree_datum.data.rels.spouses.filter(id => id !== datum.id)
        rels.spouses = rels.spouses.filter(id => id !== rel_tree_datum.data.id);
        const childrens_parent = to_current ? datum : rel_tree_datum.data
        const other_parent = to_current ? rel_tree_datum.data : datum;
        (rels.children || []).forEach(id => {
          const child = store.getDatum(id)
          if (child.rels.father === other_parent.id) child.rels.father = null
          if (child.rels.mother === other_parent.id) child.rels.mother = null
        })
        if (other_parent.rels.children) {
          other_parent.rels.children = other_parent.rels.children.filter(ch_id => !(childrens_parent.rels.children || []).includes(ch_id))
        }
        onAccept()
      }
    }

    function handleChildrenRemoval() {
      rels.children = rels.children.filter(id => id !== rel_tree_datum.data.id)
      const datum_rel_type = rel_tree_datum.data.rels.father === datum.id ? 'father' : 'mother'
      rel_tree_datum.data.rels[datum_rel_type] = null
      onAccept()
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