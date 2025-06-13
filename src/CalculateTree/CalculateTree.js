import d3 from "../d3.js"
import {sortChildrenWithSpouses, sortAddNewChildren, setupSiblings, handlePrivateCards} from "./CalculateTree.handlers.js"
import {createNewPerson} from "../CreateTree/newPerson.js"
import {isAllRelativeDisplayed} from "../handlers/general.js"
import {handleDuplicateSpouseToggle, handleDuplicateHierarchyProgeny} from "./CalculateTree.duplicatesProgeny.js"
import {handleDuplicateHierarchyAncestry} from "./CalculateTree.duplicatesAncestry.js"

export default function CalculateTree({
    data, main_id=null,
    node_separation=250,
    level_separation=150,
    single_parent_empty_card=true,
    is_horizontal=false,
    one_level_rels=false,
    sortChildrenFunction=undefined,
    sortSpousesFunction=undefined,
    ancestry_depth=undefined,
    progeny_depth=undefined,
    show_siblings_of_main=false,
    modifyTreeHierarchy=undefined,
    private_cards_config=undefined,
    duplicate_branch_toggle=false,
    on_toggle_one_close_others=true
  }) {
  if (!data || !data.length) return {data: [], data_stash: [], dim: {width: 0, height: 0}, main_id: null}
  if (is_horizontal) [node_separation, level_separation] = [level_separation, node_separation]
  const data_stash = single_parent_empty_card ? createRelsToAdd(data) : data
  const main = (main_id !== null && data_stash.find(d => d.id === main_id)) || data_stash[0]
  const tree_children = calculateTreePositions(main, 'children', false)
  const tree_parents = calculateTreePositions(main, 'parents', true)

  data_stash.forEach(d => d.main = d === main)
  levelOutEachSide(tree_parents, tree_children)
  const tree = mergeSides(tree_parents, tree_children)
  setupChildrenAndParents({tree})
  setupSpouses({tree, node_separation})
  if (show_siblings_of_main && !one_level_rels) setupSiblings({tree, data_stash, node_separation, sortChildrenFunction})
  setupProgenyParentsPos({tree})
  nodePositioning({tree})
  tree.forEach(d => d.all_rels_displayed = isAllRelativeDisplayed(d, tree))
  if (private_cards_config) handlePrivateCards({tree, data_stash, private_cards_config})
  setupTid({tree})
  setupFromTo(tree)
  if (duplicate_branch_toggle) handleDuplicateSpouseToggle(tree)
  const dim = calculateTreeDim(tree, node_separation, level_separation)

  return {data: tree, data_stash, dim, main_id: main.id, is_horizontal}

  function calculateTreePositions(datum, rt, is_ancestry) {
    const hierarchyGetter = rt === "children" ? hierarchyGetterChildren : hierarchyGetterParents
    const d3_tree = d3.tree().nodeSize([node_separation, level_separation]).separation(separation)
    const root = d3.hierarchy(datum, hierarchyGetter)

    if (is_ancestry) addSpouseReferences(root)
    trimTree(root, is_ancestry)
    if (duplicate_branch_toggle) handleDuplicateHierarchy(root, data_stash, is_ancestry)
    if (modifyTreeHierarchy) modifyTreeHierarchy(root, is_ancestry)
    d3_tree(root);
    
    return root.descendants()

    function separation(a, b) {
      let offset = 1;
      if (!is_ancestry) {
        if (!sameParent(a, b)) offset+=.25
        if (!one_level_rels) {
          if (someSpouses(a,b)) offset+=offsetOnPartners(a,b)
        }
        if (sameParent(a, b) && !sameBothParents(a,b)) offset+=.125
      }
      return offset
    }

    function hasCh(d) {return !!d.children}
    function sameParent(a, b) {return a.parent == b.parent}
    function sameBothParents(a, b) {return (a.data.rels.father === b.data.rels.father) && (a.data.rels.mother === b.data.rels.mother)}
    function someChildren(a, b) {return hasCh(a) || hasCh(b)}
    function hasSpouses(d) {return d.data.rels.spouses && d.data.rels.spouses.length > 0}
    function someSpouses(a, b) {return hasSpouses(a) || hasSpouses(b)}

    function hierarchyGetterChildren(d) {
      const children = [...(d.rels.children || [])].map(id => data_stash.find(d => d.id === id))
      if (sortChildrenFunction) children.sort(sortChildrenFunction)  // first sort by custom function if provided
      sortAddNewChildren(children)  // then put new children at the end
      if (sortSpousesFunction) sortSpousesFunction(d, data_stash)
      sortChildrenWithSpouses(children, d, data_stash)  // then sort by order of spouses
      return children
    }

    function hierarchyGetterParents(d) {
      return [d.rels.father, d.rels.mother]
        .filter(d => d).map(id => data_stash.find(d => d.id === id))
    }

    function offsetOnPartners(a,b) {
      return ((a.data.rels.spouses || []).length + (b.data.rels.spouses || []).length)*.5
    }
  }

  function levelOutEachSide(parents, children) {
    const mid_diff = (parents[0].x - children[0].x) / 2
    parents.forEach(d => d.x-=mid_diff)
    children.forEach(d => d.x+=mid_diff)
  }

  function mergeSides(parents, children) {
    parents.forEach(d => {d.is_ancestry = true})
    parents.forEach(d => d.depth === 1 ? d.parent = children[0] : null)

    return [...children, ...parents.slice(1)];
  }
  function nodePositioning({tree}) {
    tree.forEach(d => {
      d.y *= (d.is_ancestry ? -1 : 1)
      if (is_horizontal) {
        const d_x = d.x; d.x = d.y; d.y = d_x
      }
    })
  }

  function setupSpouses({tree, node_separation}) {
    for (let i = tree.length; i--;) {
      const d = tree[i]
      if (!d.is_ancestry && d.data.rels.spouses && d.data.rels.spouses.length > 0){
        if (one_level_rels && d.depth > 0) continue
        const side = d.data.data.gender === "M" ? -1 : 1;  // female on right
        d.x += d.data.rels.spouses.length/2*node_separation*side;
        d.data.rels.spouses.forEach((sp_id, i) => {
          const spouse = {data: data_stash.find(d0 => d0.id === sp_id), added: true}

          spouse.x = d.x-(node_separation*(i+1))*side;
          spouse.y = d.y
          spouse.sx = i > 0 ? spouse.x : spouse.x + (node_separation/2)*side
          spouse.sy = i > 0 ? spouse.y : spouse.y + (node_separation/2)*side
          spouse.depth = d.depth;
          spouse.spouse = d;
          if (!d.spouses) d.spouses = []
          d.spouses.push(spouse)
          tree.push(spouse)
        })
      }
      if (d.parents && d.parents.length === 2) {
        const p1 = d.parents[0],
          p2 = d.parents[1],
          midd = p1.x - (p1.x - p2.x)/2,
          x = (d,sp) => midd + (node_separation/2)*(d.x < sp.x ? 1 : -1)

        p2.x = x(p1, p2); p1.x = x(p2, p1)
      }
    }
  }

  function setupProgenyParentsPos({tree}) {
    tree.forEach(d => {
      if (d.is_ancestry) return
      if (d.depth === 0) return
      if (d.added) return
      if (d.sibling) return
      const p1 = d.parent
      const p2 = (p1.spouses || []).find(d0 => d0.data.id === d.data.rels.father || d0.data.id === d.data.rels.mother)
      if (p1 && p2) {
        if (!p1.added && !p2.added) console.error('no added spouse', p1, p2)
        const added_spouse = p1.added ? p1 : p2
        setupParentPos(d, added_spouse)
      } else if (p1 || p2) {
        const parent = p1 || p2
        parent.sx = parent.x
        parent.sy = parent.y
        setupParentPos(d, parent)
      }

      function setupParentPos(d, p) {
        d.psx = !is_horizontal ? p.sx : p.y
        d.psy = !is_horizontal ? p.y : p.sx
      }
    })
  }

  function setupChildrenAndParents({tree}) {
    tree.forEach(d0 => {
      delete d0.children
      tree.forEach(d1 => {
        if (d1.parent === d0) {
          if (d1.is_ancestry) {
            if (!d0.parents) d0.parents = []
            d0.parents.push(d1)
          } else {
            if (!d0.children) d0.children = []
            d0.children.push(d1)
          }
        }
      })
    })
  }

  function calculateTreeDim(tree, node_separation, level_separation) {
    if (is_horizontal) [node_separation, level_separation] = [level_separation, node_separation]
    const w_extent = d3.extent(tree, d => d.x)
    const h_extent = d3.extent(tree, d => d.y)
    return {
      width: w_extent[1] - w_extent[0]+node_separation, height: h_extent[1] - h_extent[0]+level_separation, x_off: -w_extent[0]+node_separation/2, y_off: -h_extent[0]+level_separation/2
    }
  }

  function createRelsToAdd(data) {
    const to_add_spouses = [];
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      if (d.rels.children && d.rels.children.length > 0) {
        if (!d.rels.spouses) d.rels.spouses = []
        const is_father = d.data.gender === "M"
        let to_add_spouse

        d.rels.children.forEach(d0 => {
          const child = data.find(d1 => d1.id === d0)
          if (child.rels[is_father ? 'father' : 'mother'] !== d.id) return
          if (child.rels[!is_father ? 'father' : 'mother']) return
          if (!to_add_spouse) {
            to_add_spouse = findOrCreateToAddSpouse(d)
          }
          to_add_spouse.rels.children.push(child.id)
          child.rels[!is_father ? 'father' : 'mother'] = to_add_spouse.id
        })
      }
    }
    to_add_spouses.forEach(d => data.push(d))
    return data

    function findOrCreateToAddSpouse(d) {
      const spouses = d.rels.spouses.map(sp_id => data.find(d0 => d0.id === sp_id))
      return spouses.find(sp => sp.to_add) || createToAddSpouse(d)
    }

    function createToAddSpouse(d) {
      const spouse = createNewPerson({
        data: {gender: d.data.gender === "M" ? "F" : "M"},
        rels: {spouses: [d.id], children: []}
      });
      spouse.to_add = true;
      to_add_spouses.push(spouse);
      d.rels.spouses.push(spouse.id)
      return spouse
    }
  }

  function trimTree(root, is_ancestry) {
    let max_depth = is_ancestry ? ancestry_depth : progeny_depth
    if (one_level_rels) max_depth = 1
    if (!max_depth && max_depth !== 0) return root

    trimNode(root, 0)

    return root

    function trimNode(node, depth) {
      if (depth === max_depth) {
        if (node.children) delete node.children
      } else if (node.children) {
        node.children.forEach(child => {
          trimNode(child, depth+1)
        })
      }
    }
  }

  function addSpouseReferences(root) {
    addSpouses(root)

    function addSpouses(d) {
      if (d.children && d.children.length === 2) {
        d.children[0]._spouse = d.children[1]
        d.children[1]._spouse = d.children[0]
      }
      if (d.children) d.children.forEach(d0 => addSpouses(d0))
    }
  }

  function setupFromTo(tree) {
    tree.forEach(d => {
      if (d.data.main) {
        d.from = []
        d.to = []
        d.to_ancestry = d.parents
      } else if (d.is_ancestry) {
        d.from = [d.parent]
        d.to = d.parents
      } else {
        if (d.added) {
          d.from = []
          d.from_spouse = d.spouse
          d.to = []
          return
        }
        if (d.sibling) return
        const p1 = d.parent
        const p2 = (d.parent.spouses || []).find(d0 => d0.data.id === d.data.rels.father || d0.data.id === d.data.rels.mother)

        d.from = [p1]
        if (p2) d.from.push(p2)

        if (!p1.to) p1.to = []
        p1.to.push(d)
        if (p2) {
          if (!p2.to) p2.to = []
          p2.to.push(d)
        }
      }
    })
  }
  
  function handleDuplicateHierarchy(root, data_stash, is_ancestry) {
    if (is_ancestry) handleDuplicateHierarchyAncestry(root, on_toggle_one_close_others)
    else handleDuplicateHierarchyProgeny(root, data_stash, on_toggle_one_close_others)
  }
}

function setupTid({tree}) {
  const ids = []
  tree.forEach(d => {
    if (ids.includes(d.data.id)) {
      const duplicates = tree.filter(d0 => d0.data.id === d.data.id)
      duplicates.forEach((d0, i) => {
        d0.tid = `${d.data.id}--x${i+1}`
        d0.duplicate = duplicates.length
        ids.push(d.data.id)
      })
    } else {
      d.tid = d.data.id
      ids.push(d.data.id)
    }
  })
}