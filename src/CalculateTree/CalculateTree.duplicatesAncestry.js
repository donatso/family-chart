export function handleDuplicateHierarchyAncestry(root, on_toggle_one_close_others=true) {
  const ancestry_duplicates = []

  loopChildren(root)

  setToggleIds(ancestry_duplicates)


  function loopChildren(d) {
    if (d.children) {
      if (ancestry_duplicates.some(d0 => d0.includes(d))) {
        return
      }
      const duplicates = findDuplicates(d.children)
      if (duplicates.length > 0) {
        const all_duplicates = [d, ...duplicates]
        ancestry_duplicates.push(all_duplicates)
        assignDuplicateValues(all_duplicates)
        handleToggleOff(all_duplicates)
      } else {
        d.children.forEach(child => {
          loopChildren(child)
        })
      }
    }
  }

  function assignDuplicateValues(all_duplicates) {
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

  function handleToggleOff(all_duplicates) {
    all_duplicates.forEach(d => {
      const parent_id = root === d ? 'main' : d.parent.data.id
      if (d.data._tgdp[parent_id] < 0) delete d.children
    })
  }

  function findDuplicates(children_1) {
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
  }

  function checkIfDuplicate(arr1, arr2) {
    return arr1 !== arr2 && arr1.every(d => arr2.some(d0 => d.data.id === d0.data.id))
  }

  function setToggleIds(ancestry_duplicates) {
    let toggle_id = 0
    ancestry_duplicates.forEach(dupl_arr => {
      toggle_id = toggle_id+1
      dupl_arr.forEach(d => {
        d._toggle_id = toggle_id
      })
    })
  }
}