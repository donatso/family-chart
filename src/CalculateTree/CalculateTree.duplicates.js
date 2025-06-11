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

export function handleDuplicateHierarchy(root, data_stash, is_ancestry, on_toggle_one_close_others=true) {
  const progeny_duplicates = []
  const ancestry_duplicates = []
  if (is_ancestry) {
    loopChildrenAncestry(root)
  } else {
    loopChildrenProgeny(root)
  }
  setToggleIds(progeny_duplicates, ancestry_duplicates)

  function loopChildrenProgeny(d) {
    if (!d.children) return
    const p1 = d.data
    const spouses = (d.data.rels.spouses || []).map(id => data_stash.find(d => d.id === id))

    const children_by_spouse = getChildrenBySpouse(d)
    spouses.forEach(p2 => {
      if (progeny_duplicates.some(d => d.some(d => checkIfDuplicateProgeny([p1, p2], [d.p1, d.p2])))) {
        return
      }
      const duplicates = findDuplicateProgeny(d, p1, p2)
      if (duplicates.length > 0) {
        const all_duplicates = [{d, p1, p2}, ...duplicates]
        progeny_duplicates.push(all_duplicates)
        assignDuplicateValues(all_duplicates)
        handleToggleOff(all_duplicates)
      } else {
        let parent_id = root === d ? 'main' : d.parent.data.id
        stashTgdpSpouse(d, parent_id, p2);
        (children_by_spouse[p2.id] || []).forEach(child => {
          loopChildrenProgeny(child)
        })
      }
    })
  }

  function assignDuplicateValues(all_duplicates) {
    all_duplicates.forEach(({d, p1, p2}, i) => {
      if (!d.data._tgdp_sp) d.data._tgdp_sp = {}
      let parent_id = root === d ? 'main' : d.parent.data.id
      unstashTgdpSpouse(d, parent_id, p2)
      if (!d.data._tgdp_sp[parent_id]) d.data._tgdp_sp[parent_id] = {}
      let val = 1
      if (!d.data._tgdp_sp[parent_id].hasOwnProperty(p2.id)) d.data._tgdp_sp[parent_id][p2.id] = val
      else val = d.data._tgdp_sp[parent_id][p2.id]
      all_duplicates[i].val = val
    })

    if (on_toggle_one_close_others) {
      if (all_duplicates.every(d => d.val < 0)) {
        const first_duplicate = all_duplicates.sort((a, b) => b.val - a.val)[0]
        const {d, p1, p2} = first_duplicate
        const parent_id = root === d ? 'main' : d.parent.data.id
        d.data._tgdp_sp[parent_id][p2.id] = 1
      }
  
      if (all_duplicates.filter(d => d.val > 0).length > 1) {
        const latest_duplicate = all_duplicates.sort((a, b) => b.val - a.val)[0]
        all_duplicates.forEach(dupl => {
          if (dupl === latest_duplicate) return
          const {d, p1, p2} = dupl
          const parent_id = root === d ? 'main' : d.parent.data.id
          d.data._tgdp_sp[parent_id][p2.id] = -1
        })
      }
    }
  }

  function handleToggleOff(all_duplicates) {
    all_duplicates.forEach(({d, p1, p2}) => {
      const parent_id = root === d ? 'main' : d.parent.data.id
      if (d.data._tgdp_sp[parent_id][p2.id] < 0) {
        const children_by_spouse = getChildrenBySpouse(d)
        if (children_by_spouse[p2.id]) {
          d.children = d.children.filter(c => !children_by_spouse[p2.id].includes(c))
          if (d.children.length === 0) delete d.children
        }
      }
    })
  }

  function stashTgdpSpouse(d, parent_id, p2) {
    if (d.data._tgdp_sp && d.data._tgdp_sp[parent_id] && d.data._tgdp_sp[parent_id].hasOwnProperty(p2.id)) {
      if (!d.data.__tgdp_sp) d.data.__tgdp_sp = {}
      if (!d.data.__tgdp_sp[parent_id]) d.data.__tgdp_sp[parent_id] = {}
      d.data.__tgdp_sp[parent_id][p2.id] = d.data._tgdp_sp[parent_id][p2.id]
      delete d.data._tgdp_sp[parent_id][p2.id]
    }
  }

  function unstashTgdpSpouse(d, parent_id, p2) {
    if (d.data.__tgdp_sp && d.data.__tgdp_sp[parent_id] && d.data.__tgdp_sp[parent_id].hasOwnProperty(p2.id)) {
      d.data._tgdp_sp[parent_id][p2.id] = d.data.__tgdp_sp[parent_id][p2.id]
      delete d.data.__tgdp_sp[parent_id][p2.id]
    }
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
        const children_by_spouse = getChildrenBySpouse(d)
        spouses.forEach(p2 => {
          if (checkIfDuplicateProgeny([partner1, partner2], [p1, p2])) {
            duplicates.push({d, p1, p2})
          } else {
            (children_by_spouse[p2.id] || []).forEach(child => {
              checkChildren(child)
            })
          }
        })
      }
    }
  }

  function checkIfDuplicateProgeny(arr1, arr2) {
    return arr1.every(d => arr2.some(d0 => d.id === d0.id))
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

  // ancestry duplicates

  function loopChildrenAncestry(d) {
    if (d.children) {
      if (ancestry_duplicates.some(d0 => d0.includes(d))) {
        return
      }
      const duplicates = findDuplicateAncestry(d.children)
      if (duplicates.length > 0) {
        const all_duplicates = [d, ...duplicates]
        ancestry_duplicates.push(all_duplicates)
        assignDuplicateValuesAncestry(all_duplicates)
        handleToggleOffAncestry(all_duplicates)
      } else {
        d.children.forEach(child => {
          loopChildrenAncestry(child)
        })
      }
    }
  }

  function assignDuplicateValuesAncestry(all_duplicates) {
    all_duplicates.forEach(d => {
      if (!d.data._tgdp) d.data._tgdp = {}
      const parent_id = root === d ? 'main' : d.parent.data.id
      if (!d.data._tgdp[parent_id]) d.data._tgdp[parent_id] = -1
      d._toggle = d.data._tgdp[parent_id]
    })

    if (on_toggle_one_close_others) {
      if (all_duplicates.every(d => d._toggle < 0)) {
        const first_duplicate = all_duplicates.sort((a, b) => b._toggle - a._toggle)[0]
        const d= first_duplicate
        const parent_id = root === d ? 'main' : d.parent.data.id
        d.data._tgdp[parent_id] = 1
      }
  
      if (all_duplicates.filter(d => d._toggle > 0).length > 1) {
        const latest_duplicate = all_duplicates.sort((a, b) => b._toggle - a._toggle)[0]
        all_duplicates.forEach(dupl => {
          if (dupl === latest_duplicate) return
          const d = dupl
          const parent_id = root === d ? 'main' : d.parent.data.id
          d.data._tgdp[parent_id] = -1
        })
      }
    }
  }

  function handleToggleOffAncestry(all_duplicates) {
    all_duplicates.forEach(d => {
      const parent_id = root === d ? 'main' : d.parent.data.id
      if (d.data._tgdp[parent_id] < 0) delete d.children
    })
  }

  function findDuplicateAncestry(children_1) {
    const duplicates = []
    checkChildren(root)
    return duplicates

    function checkChildren(d) {
      if (d.children) {
        if (checkIfDuplicateAncestry(children_1, d.children)) {
          duplicates.push(d)
        } else {
          d.children.forEach(child => {
            checkChildren(child)
          })
        }
      }
    }
  }

  function checkIfDuplicateAncestry(arr1, arr2) {
    return arr1 !== arr2 && arr1.every(d => arr2.some(d0 => d.data.id === d0.data.id))
  }

  function setToggleIds(progeny_duplicates, ancestry_duplicates) {
    let toggle_id = 0
    progeny_duplicates.forEach(dupl_arr => {
      toggle_id = toggle_id+1
      dupl_arr.forEach(d => {
        if (!d.d._toggle_id_sp) d.d._toggle_id_sp = {}
        d.d._toggle_id_sp[d.p2.id] = toggle_id
      })
    })
    ancestry_duplicates.forEach(dupl_arr => {
      toggle_id = toggle_id+1
      dupl_arr.forEach(d => {
        d._toggle_id = toggle_id
      })
    })
  }
}