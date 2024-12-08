import d3 from "../d3.js"
import {sortChildrenWithSpouses} from "./CalculateTree.handlers.js"
import {createNewPerson} from "../CreateTree/newPerson.js"
import {isAllRelativeDisplayed} from "../handlers/general.js"

export default function CalculateTree({data, main_id=null, node_separation=250, level_separation=150, single_parent_empty_card=true, is_horizontal=false}) {
  if (!data || !data.length) return {data: [], data_stash: [], dim: {width: 0, height: 0}, main_id: null}
  if (is_horizontal) [node_separation, level_separation] = [level_separation, node_separation]
  const data_stash = single_parent_empty_card ? createRelsToAdd(data) : data
  sortChildrenWithSpouses(data_stash)
  const main = (main_id !== null && data_stash.find(d => d.id === main_id)) || data_stash[0]
  const tree_children = calculateTreePositions(main, 'children', false)
  const tree_parents = calculateTreePositions(main, 'parents', true)

  data_stash.forEach(d => d.main = d === main)
  levelOutEachSide(tree_parents, tree_children)
  const tree = mergeSides(tree_parents, tree_children)
  setupChildrenAndParents({tree})
  setupSpouses({tree, node_separation})
  setupProgenyParentsPos({tree})
  nodePositioning({tree})
  tree.forEach(d => d.all_rels_displayed = isAllRelativeDisplayed(d, tree))

  const dim = calculateTreeDim(tree, node_separation, level_separation)

  return {data: tree, data_stash, dim, main_id: main.id, is_horizontal}

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
      const m = findDatum(d.data.rels.mother)
      const f = findDatum(d.data.rels.father)
      if (m && f) {
        if (!m.added && !f.added) console.error('no added spouse', m, f)
        const added_spouse = m.added ? m : f
        setupParentPos(d, added_spouse)
      } else if (m || f) {
        const parent = m || f
        parent.sx = parent.x
        parent.sy = parent.y
        setupParentPos(d, parent)
      }

      function setupParentPos(d, p) {
        d.psx = !is_horizontal ? p.sx : p.y
        d.psy = !is_horizontal ? p.y : p.sx
      }
    })

    function findDatum(id) {
      if (!id) return null
      return tree.find(d => d.data.id === id)
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
