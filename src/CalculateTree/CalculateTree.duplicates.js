export function handleDuplicateSpouseToggle(tree) {
  tree.forEach(d => {
    if (!d.spouse) return
    const spouse = d.spouse
    if (d.duplicate && spouse.data._tgdp_sp) {
      const parent_id = spouse.data.main ? 'main' : spouse.parent.data.id
      if (spouse.data._tgdp_sp[parent_id]?.hasOwnProperty(d.data.id)) {
        d._toggle = spouse.data._tgdp_sp[parent_id][d.data.id]
      }
    }
  })
}

export function handleDuplicateHierarchy(root, data_stash, is_ancestry) {
  if (is_ancestry) {
    loopChildrenAncestry(root)
  } else {
    loopChildrenProgeny(root)
  }

  function loopChildrenProgeny(d) {
    if (!d.children) return
    const p1 = d.data
    const spouses = (d.data.rels.spouses || []).map(id => data_stash.find(d => d.id === id))

    const children_by_spouse = getChildrenBySpouse(d)
    spouses.forEach(p2 => {
      const duplicates = findDuplicateProgeny(d, p1, p2)
      if (duplicates.length > 0) {
        const all_duplicates = [{d, p1, p2}, ...duplicates]
        all_duplicates.forEach(({d, p1, p2}) => {
          const children_by_spouse = getChildrenBySpouse(d)
          if (!d.data._tgdp_sp) d.data._tgdp_sp = {}
          let parent_id = root === d ? 'main' : d.parent.data.id
          if (!d.data._tgdp_sp[parent_id]) d.data._tgdp_sp[parent_id] = {}
          if (!d.data._tgdp_sp[parent_id][p2.id]) d.data._tgdp_sp[parent_id][p2.id] = false
          if (d.data._tgdp_sp[parent_id][p2.id]) {
            if (children_by_spouse[p2.id]) {
              d.children = d.children.filter(c => !children_by_spouse[p2.id].includes(c))
              if (d.children.length === 0) delete d.children
            }
          }
        })
      } else {
        if (d.data)
        (children_by_spouse[p2.id] || []).forEach(child => {
          loopChildrenProgeny(child)
        })
      }
    })
  }

  function findDuplicateProgeny(datum, partner1, partner2) {
    const duplicates = []
    checkChildren(root)
    return duplicates

    function checkChildren(d) {
      if (d === datum) return
      if (d.children) {
        const p1 = d.data
        const spouses = (d.data.rels.spouses || []).map(id => data_stash.find(d => d.id === id))
        spouses.forEach(p2 => {
          if (checkIfDuplicate([partner1, partner2], [p1, p2])) {
            duplicates.push({d, p1, p2})
          } else {
            d.children.forEach(child => {
              checkChildren(child)
            })
          }
        })
      }
    }

    function checkIfDuplicate(arr1, arr2) {
      return arr1.every(d => arr2.some(d0 => d.id === d0.id))
    }
  }

  function getChildrenBySpouse(d) {
    const children_by_spouse = {}
    const p1 = d;
    (d.children || []).forEach(child => {
      const ch_rels = child.data.rels
      const p2_id = ch_rels.father === p1.data.id ? ch_rels.mother : ch_rels.father
      if (!children_by_spouse[p2_id]) children_by_spouse[p2_id] = []
      children_by_spouse[p2_id].push(child)
    })
    return children_by_spouse
  }

  function loopChildrenAncestry(d) {
    if (d.children) {
      const duplicates = findDuplicateAncestry(d.children)
      if (duplicates.length > 0) {
        const all_duplicates = [d, ...duplicates]
        all_duplicates.forEach(d => {
          if (!d.data._tgdp) d.data._tgdp = {}
          const parent_id = root === d ? 'main' : d.parent.data.id
          if (!d.data._tgdp[parent_id]) d.data._tgdp[parent_id] = false
          d._toggle = d.data._tgdp[parent_id]
        })
        all_duplicates.forEach(d => {
          const parent_id = root === d ? 'main' : d.parent.data.id
          if (d.data._tgdp[parent_id]) delete d.children
        })
      } else {
        d.children.forEach(child => {
          loopChildrenAncestry(child)
        })
      }
    }
  }

  function findDuplicateAncestry(children_1) {
    const duplicates = []
    checkChildren(root)
    return duplicates

    function checkChildren(d) {
      if (d.children) {
        if (checkIfDuplicate(children_1, d.children)) {
          duplicates.push(d)
        } else {
        d.children.forEach(child => {
            checkChildren(child)
          })
        }
      }
    }

    function checkIfDuplicate(arr1, arr2) {
      return arr1 !== arr2 && arr1.every(d => arr2.some(d0 => d.data.id === d0.data.id))
    }
  }
}