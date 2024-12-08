export function createLinks({d, tree, is_horizontal=false}) {
  const links = [];

  if (d.data.rels.spouses && d.data.rels.spouses.length > 0) handleSpouse({d})
  handleAncestrySide({d})
  handleProgenySide({d})

  return links;

  function handleAncestrySide({d}) {
    if (!d.parents) return
    const p1 = d.parents[0]
    const p2 = d.parents[1] || p1

    const p = {x: getMid(p1, p2, 'x'), y: getMid(p1, p2, 'y')}

    links.push({
      d: Link(d, p),
      _d: () => {
        const _d = {x: d.x, y: d.y},
          _p = {x: d.x, y: d.y}
        return Link(_d, _p)
      },
      curve: true, 
      id: linkId(d, p1, p2), 
      depth: d.depth+1, 
      is_ancestry: true,
      source: d,
      target: [p1, p2]
    })
  }


  function handleProgenySide({d}) {
    if (!d.children || d.children.length === 0) return

    d.children.forEach((child, i) => {
      const other_parent = otherParent(child, d, tree) || d
      const sx = other_parent.sx

      const parent_pos = !is_horizontal ? {x: sx, y: d.y} : {x: d.x, y: sx}
      links.push({
        d: Link(child, parent_pos),
        _d: () => Link(parent_pos, {x: _or(parent_pos, 'x'), y: _or(parent_pos, 'y')}),
        curve: true,
        id: linkId(child, d, other_parent),
        depth: d.depth+1,
        is_ancestry: false,
        source: [d, other_parent],
        target: child
      })
    })
  }


  function handleSpouse({d}) {
    d.data.rels.spouses.forEach(sp_id => {
      const spouse = getRel(d, tree, d0 => d0.data.id === sp_id)
      if (!spouse || d.spouse) return
      links.push({
        d: [[d.x, d.y], [spouse.x, spouse.y]],
        _d: () => [
          d.is_ancestry ? [_or(d, 'x')-.0001, _or(d, 'y')] : [d.x, d.y], // add -.0001 to line to have some length if d.x === spouse.x
          d.is_ancestry ? [_or(spouse, 'x', true), _or(spouse, 'y')] : [d.x-.0001, d.y]
        ],
        curve: false, 
        id: linkId(d, spouse), 
        depth: d.depth, 
        spouse: true, 
        is_ancestry: spouse.is_ancestry, 
        source: d, 
        target: spouse
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
    return is_horizontal ? LinkHorizontal(d, p) : LinkVertical(d, p)
  }

  function LinkVertical(d, p) {
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

  function LinkHorizontal(d, p) {
    const hx = (d.x + (p.x - d.x) / 2)
    return [
      [d.x, d.y],
      [hx, d.y],
      [hx, d.y],
      [hx, p.y],
      [hx, p.y],
      [p.x, p.y],
    ]
  }

  function linkId(...args) {
    return args.map(d => d.data.id).sort().join(", ")  // make unique id
  }

  function otherParent(child, p1, data) {
    const condition = d0 => (d0.data.id !== p1.data.id) && ((d0.data.id === child.data.rels.mother) || (d0.data.id === child.data.rels.father))
    return getRel(p1, data, condition)
  }

  // if there is overlapping of personas in different branches of same family tree, return the closest one
  function getRel(d, data, condition) {
    const rels = data.filter(condition)
    const dist_xy = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
    if (rels.length > 1) return rels.sort((d0, d1) => dist_xy(d0, d) - dist_xy(d1, d))[0]
    else return rels[0]
  }
}

export function pathToMain(cards, links, datum, main_datum) {
  const is_ancestry = datum.is_ancestry
  const links_data = links.data()
  let links_node_to_main = []
  let cards_node_to_main = []

  if (is_ancestry) {
    const links_to_main = []

    let parent = datum
    let itteration1 = 0
    while (parent !== main_datum.data && itteration1 < 100) {
      itteration1++  // to prevent infinite loop
      const spouse_link = links_data.find(d => d.spouse === true && (d.source === parent || d.target === parent))
      if (spouse_link) {
        const child_link = links_data.find(d => Array.isArray(d.target) && d.target.includes(spouse_link.source) && d.target.includes(spouse_link.target))
        if (!child_link) break
        links_to_main.push(spouse_link)
        links_to_main.push(child_link)
        parent = child_link.source
      } else {
        // single parent
        const child_link = links_data.find(d => Array.isArray(d.target) && d.target.includes(parent))
        if (!child_link) break
        links_to_main.push(child_link)
        parent = child_link.source
      }
    }
    links.each(function(d) {
      if (links_to_main.includes(d)) {
        links_node_to_main.push({link: d, node: this})
      }
    })

    const cards_to_main = getCardsToMain(datum, links_to_main)
    cards.each(function(d) {
      if (cards_to_main.includes(d)) {
        cards_node_to_main.push({card: d, node: this})
      }
    })
  } else if (datum.spouse && datum.spouse.data === main_datum.data) {
    links.each(function(d) {
      if (d.target === datum) links_node_to_main.push({link: d, node: this})
    })
    const cards_to_main = [main_datum, datum]
    cards.each(function(d) {
      if (cards_to_main.includes(d)) {
        cards_node_to_main.push({card: d, node: this})
      }
    })
  } else {
    let links_to_main = []

    let child = datum
    let itteration1 = 0
    while (child !== main_datum.data && itteration1 < 100) {
      itteration1++  // to prevent infinite loop
      const child_link = links_data.find(d => d.target === child && Array.isArray(d.source))
      if (child_link) {
        const spouse_link = links_data.find(d => d.spouse === true && sameArray([d.source, d.target], child_link.source))
        links_to_main.push(child_link)
        links_to_main.push(spouse_link)
        if (spouse_link) child = spouse_link.source
        else child = child_link.source[0]
      } else {
        const spouse_link = links_data.find(d => d.target === child && !Array.isArray(d.source))  // spouse link
        if (!spouse_link) break
        links_to_main.push(spouse_link)
        child = spouse_link.source
      }
    }

    links.each(function(d) {
      if (links_to_main.includes(d)) {
        links_node_to_main.push({link: d, node: this})
      }
    })

    const cards_to_main = getCardsToMain(main_datum, links_to_main)
    cards.each(function(d) {
      if (cards_to_main.includes(d)) {
        cards_node_to_main.push({card: d, node: this})
      }
    })
  }
  return [cards_node_to_main, links_node_to_main]

  function sameArray(arr1, arr2) {
    return arr1.every(d1 => arr2.some(d2 => d1 === d2))
  }

  function getCardsToMain(first_parent, links_to_main) {
    const all_cards = links_to_main.filter(d => d).reduce((acc, d) => {
      if (Array.isArray(d.target)) acc.push(...d.target)
      else acc.push(d.target)
      if (Array.isArray(d.source)) acc.push(...d.source)
      else acc.push(d.source)
      return acc
    }, [])

    const cards_to_main = [main_datum, datum]
    getChildren(first_parent)
    return cards_to_main

    function getChildren(d) {
      if (d.data.rels.children) {
        d.data.rels.children.forEach(child_id => {
          const child = all_cards.find(d0 => d0.data.id === child_id)
          if (child) {
            cards_to_main.push(child)
            getChildren(child)
          }
        })
      }
    }
  }
}



