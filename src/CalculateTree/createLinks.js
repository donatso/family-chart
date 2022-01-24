export function createLinks({d, tree, is_vertical}) {
  const links = [];

  if (d.data.rels.spouses && d.data.rels.spouses.length > 0) handleSpouse({d})
  handleAncestrySide({d})
  handleProgenySide({d})

  return links;

  function handleAncestrySide({d}) {
    if (!d.parents || d.parents.length !== 2) return
    const p1 = d.parents[0], p2 = d.parents[1]

    const p = {x: getMid(p1, p2, 'x'), y: getMid(p1, p2, 'y')}

    links.push({
      d: Link(d, p),
      _d: () => {
        const _d = {x: d.x, y: d.y},
          _p = {x: d.x, y: d.y}
        return Link(_d, _p)
      },
      curve: true, id: linkId(d, d.parents[0], d.parents[1]), depth: d.depth+1, is_ancestry: true
    })
  }


  function handleProgenySide({d}) {
    if (!d.children || d.children.length === 0) return

    d.children.forEach((child, i) => {
      const other_parent = otherParent(child, d, tree),
        sx = other_parent.sx

      links.push({
        d: Link(child, {x: sx, y: d.y}),
        _d: () => Link({x: sx, y: d.y}, {x: _or(child, 'x'), y: _or(child, 'y')}),
        curve: true, id: linkId(child, d, other_parent), depth: d.depth+1
      })
    })
  }


  function handleSpouse({d}) {
    d.data.rels.spouses.forEach(sp_id => {
      const spouse = tree.find(d0 => d0.data.id === sp_id);
      if (!spouse || d.spouse) return
      links.push({
        d: [[d.x, d.y], [spouse.x, spouse.y]],
        _d: () => [
          d.is_ancestry ? [_or(d, 'x')-.0001, _or(d, 'y')] : [d.x, d.y], // add -.0001 to line to have some length if d.x === spouse.x
          d.is_ancestry ? [_or(spouse, 'x', true), _or(spouse, 'y')] : [d.x-.0001, d.y]
        ],
        curve: false, id: [d.data.id, spouse.data.id].join(", "), depth: d.depth, spouse: true, is_ancestry: spouse.is_ancestry
      })
    })
  }

  ///
  function getMid(d1, d2, side, is_) {
    if (is_) return _or(d1, side) - (_or(d1, side) - _or(d2, side))/2
    else return d1[side] - (d1[side] - d2[side])/2
  }

  function _or(d, k) {
   return d.hasOwnProperty('_'+k) ? d['_'+k] : d[k]
  }

  function Link(d, p) {
    const hy = (d.y + (p.y - d.y) / 2)
    return [
      [d.x, d.y],
      [d.x, hy],
      [d.x, hy],
      [p.x, hy],
      [p.x, hy],
      [p.x, p.y],
    ]
  }

  function linkId(...args) {
    return args.map(d => d.data.id).sort().join(", ")  // make unique id
  }

  function otherParent(d, p1, data) {
    return data.find(d0 => (d0.data.id !== p1.data.id) && ((d0.data.id === d.data.rels.mother) || (d0.data.id === d.data.rels.father)))
  }
}




