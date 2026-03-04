import d3 from "../d3.js"
import {sortChildrenWithSpouses} from "./CalculateTree.handlers.js"
import {createNewPerson} from "../handlers/newPerson.js"

export default function CalculateTree({data_stash, main_id=null, is_vertical=true, node_separation=250, level_separation=150, scale_factor=0.4, max_spouse_tree_depth=2}) {
  data_stash = createRelsToAdd(data_stash)
  sortChildrenWithSpouses(data_stash)
  const main = main_id !== null ? data_stash.find(d => d.id === main_id) : data_stash[0],
    tree_children = calculateTreePositions(main, 'children', false),
    tree_parents = calculateTreePositions(main, 'parents', true)

  data_stash.forEach(d => d.main = d === main)
  levelOutEachSide(tree_parents, tree_children)
  const tree = mergeSides(tree_parents, tree_children)
  setupChildrenAndParents({tree})
  setupFractalDepth({tree, scale_factor})
  setupSpouses({tree, node_separation, scale_factor})
  nodePositioning({tree, is_vertical})
  setupSpouseAncestry({tree, data_stash, node_separation, level_separation, scale_factor, max_spouse_tree_depth})

  const dim = calculateTreeDim(tree, node_separation, level_separation, is_vertical)

  return {data: tree, data_stash, dim}

  function calculateTreePositions(datum, rt, is_ancestry) {
    const hierarchyGetter = rt === "children" ? hierarchyGetterChildren : hierarchyGetterParents,
      d3_tree = d3.tree().nodeSize([node_separation, level_separation]).separation(separation),
      root = d3.hierarchy(datum, hierarchyGetter);
    d3_tree(root);
    return root.descendants()

    function separation(a, b) {
      let offset = 1;
      if (!is_ancestry) {
        if (!sameParent(a, b)) offset+=.25
        if (someSpouses(a,b)) offset+=offsetOnPartners(a,b)
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
      return [...(d.rels.children || [])].map(id => data_stash.find(d => d.id === id))
    }

    function hierarchyGetterParents(d) {
      return [d.rels.father, d.rels.mother]
        .filter(d => d).map(id => data_stash.find(d => d.id === id))
    }

    function offsetOnPartners(a,b) {
      return (Math.max((a.data.rels.spouses || []).length, (b.data.rels.spouses || []).length))*.5+.5
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
  function nodePositioning({tree, is_vertical}) {
    tree.forEach(d => {
      d.y *= (d.is_ancestry ? -1 : 1)
      if (!is_vertical) {
        const d_x = d.x; d.x = d.y; d.y = d_x
      }
    })
  }

  function setupFractalDepth({tree, scale_factor}) {
    tree.forEach(d => {
      if (typeof d.fractal_depth === 'undefined') d.fractal_depth = 0
      d.scale = Math.pow(scale_factor, d.fractal_depth)
    })
  }

  function setupSpouses({tree, node_separation, scale_factor}) {
    for (let i = tree.length; i--;) {
      const d = tree[i]
      if (!d.is_ancestry && d.data.rels.spouses && d.data.rels.spouses.length > 0){
        const side = d.data.data.gender === "M" ? -1 : 1,  // female on right
          depth_scale = d.scale || 1;
        d.x += d.data.rels.spouses.length/2*node_separation*depth_scale*side;
        d.data.rels.spouses.forEach((sp_id, i) => {
          const spouse = {data: data_stash.find(d0 => d0.id === sp_id), added: true}

          spouse.fractal_depth = d.fractal_depth + 1;
          spouse.scale = Math.pow(scale_factor, spouse.fractal_depth);
          spouse.x = d.x-(node_separation*depth_scale*(i+1))*side;
          spouse.y = d.y
          spouse.sx = i > 0 ? spouse.x : spouse.x + (node_separation*depth_scale/2)*side
          spouse.depth = d.depth;
          spouse.spouse = d;
          if (!d.spouses) d.spouses = []
          d.spouses.push(spouse)
          tree.push(spouse)

          tree.forEach(d0 => (
            (d0.data.rels.father === d.data.id && d0.data.rels.mother === spouse.data.id) ||
            (d0.data.rels.mother === d.data.id && d0.data.rels.father === spouse.data.id)
            ) ? d0.psx = spouse.sx : null
          )
        })
      }
      if (d.parents && d.parents.length === 2) {
        const p1 = d.parents[0],
          p2 = d.parents[1],
          pair_scale = Math.min(p1.scale || 1, p2.scale || 1),
          midd = p1.x - (p1.x - p2.x)/2,
          x = (d,sp) => midd + (node_separation*pair_scale/2)*(d.x < sp.x ? 1 : -1)

        p2.x = x(p1, p2); p1.x = x(p2, p1)
      }
    }
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

  function setupSpouseAncestry({tree, data_stash, node_separation, level_separation, scale_factor, max_spouse_tree_depth}) {
    if (!max_spouse_tree_depth || max_spouse_tree_depth <= 0) return

    const in_tree = new Set(tree.map(d => d.data.id))
    let to_process = tree.filter(d => d.added && !d.data.to_add)

    for (let level = 0; level < max_spouse_tree_depth; level++) {
      const next_process = []

      for (const node of to_process) {
        const father_id = node.data.rels.father
        const mother_id = node.data.rels.mother
        if (!father_id || !mother_id) continue
        if (in_tree.has(father_id) || in_tree.has(mother_id)) continue

        const father_data = data_stash.find(d => d.id === father_id)
        const mother_data = data_stash.find(d => d.id === mother_id)
        if (!father_data || !mother_data) continue

        const s = node.scale
        const parent_y = node.y - level_separation * s
        const side = father_data.data.gender === "M" ? 1 : -1

        const father = {
          data: father_data, added: true, is_ancestry: true,
          fractal_depth: node.fractal_depth,
          scale: node.scale,
          x: node.x + (node_separation * s / 2) * side,
          y: parent_y,
          depth: node.depth + 1,
          parent: node
        }

        const mother = {
          data: mother_data, added: true, is_ancestry: true,
          fractal_depth: node.fractal_depth,
          scale: node.scale,
          x: node.x - (node_separation * s / 2) * side,
          y: parent_y,
          depth: node.depth + 1,
          parent: node,
          spouse: father
        }

        if (!father.spouses) father.spouses = []
        father.spouses.push(mother)

        node.parents = [father, mother]

        in_tree.add(father_id)
        in_tree.add(mother_id)
        tree.push(father)
        tree.push(mother)

        next_process.push(father)
        next_process.push(mother)
      }

      if (next_process.length === 0) break
      to_process = next_process
    }
  }

  function calculateTreeDim(tree, node_separation, level_separation, is_vertical) {
    if (!is_vertical) [node_separation, level_separation] = [level_separation, node_separation]
    const w_half_sep = node_separation/2,
      h_half_sep = level_separation/2,
      x_min = d3.min(tree, d => d.x - w_half_sep * (d.scale || 1)),
      x_max = d3.max(tree, d => d.x + w_half_sep * (d.scale || 1)),
      y_min = d3.min(tree, d => d.y - h_half_sep * (d.scale || 1)),
      y_max = d3.max(tree, d => d.y + h_half_sep * (d.scale || 1))
    return {
      width: x_max - x_min + node_separation, height: y_max - y_min + level_separation,
      x_off: -x_min + node_separation/2, y_off: -y_min + level_separation/2
    }
  }

  function createRelsToAdd(data) {
    const to_add_spouses = [];
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      if (d.rels.children && d.rels.children.length > 0) {
        if (!d.rels.spouses) d.rels.spouses = []
        const is_father = d.data.gender === "M"
        let spouse

        d.rels.children.forEach(d0 => {
          const child = data.find(d1 => d1.id === d0)
          if (child.rels[is_father ? 'father' : 'mother'] !== d.id) return
          if (child.rels[!is_father ? 'father' : 'mother']) return
          if (!spouse) {
            spouse = createToAddSpouse(d)
            d.rels.spouses.push(spouse.id)
          }
          spouse.rels.children.push(child.id)
          child.rels[!is_father ? 'father' : 'mother'] = spouse.id
        })
      }
    }
    to_add_spouses.forEach(d => data.push(d))
    return data

    function createToAddSpouse(d) {
      const spouse = createNewPerson({
        data: {gender: d.data.gender === "M" ? "F" : "M"},
        rels: {spouses: [d.id], children: []}
      });
      spouse.to_add = true;
      to_add_spouses.push(spouse);
      return spouse
    }
  }

}
