import { TreeDatum } from "../types/treeData"
import { Link } from "./create-links"
import { CardHtmlSelection, LinkSelection } from "../types/view"

export default function pathToMain(cards: CardHtmlSelection, links: LinkSelection, datum: TreeDatum, main_datum: TreeDatum) {
  const is_ancestry = datum.is_ancestry
  const links_data = links.data()
  let links_node_to_main: {link: Link, node: SVGPathElement}[] = []
  let cards_node_to_main: {card: TreeDatum, node: HTMLDivElement}[] = []

  if (is_ancestry) {
    const links_to_main: Link[] = []

    let parent = datum
    let itteration1 = 0
    while (parent !== main_datum && itteration1 < 100) {
      itteration1++  // to prevent infinite loop
      const spouse_link = links_data.find(d => d.spouse === true && (d.source === parent || d.target === parent))
      if (spouse_link) {
        const child_links = links_data.filter(d => Array.isArray(d.target) && d.target.includes(spouse_link.source as TreeDatum) && d.target.includes(spouse_link.target as TreeDatum))
        const child_link = getChildLinkFromAncestrySide(child_links, main_datum)

        if (!child_link) break
        links_to_main.push(spouse_link)
        links_to_main.push(child_link)
        parent = child_link.source as TreeDatum
      } else {
        // single parent
        const child_links = links_data.filter(d => Array.isArray(d.target) && d.target.includes(parent))
        const child_link = getChildLinkFromAncestrySide(child_links, main_datum)

        if (!child_link) break
        links_to_main.push(child_link)
        parent = child_link.source as TreeDatum
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
  } else if (datum.sibling) {
    links.each(function(d) {
      if (!Array.isArray(datum.parents)) throw new Error('datum.parents is not an array')

      if (d.source === datum) links_node_to_main.push({link: d, node: this})
      if (d.source === main_datum && Array.isArray(d.target) && d.target.length === 2) links_node_to_main.push({link: d, node: this})
      if (datum.parents.includes(d.source as TreeDatum) && !Array.isArray(d.target) && datum.parents.includes(d.target as TreeDatum)) links_node_to_main.push({link: d, node: this})
    })
    const cards_to_main = [main_datum, datum, ...(datum.parents || [])]
    cards.each(function(d) {
      if (cards_to_main.includes(d)) {
        cards_node_to_main.push({card: d, node: this})
      }
    })
  } else {
    let links_to_main: Link[] = []

    let child = datum
    let itteration1 = 0
    while (child !== main_datum && itteration1 < 100) {
      itteration1++  // to prevent infinite loop
      const child_link = links_data.find(d => d.target === child && Array.isArray(d.source))
      if (child_link) {
        const spouse_link = links_data.find(d => d.spouse === true && sameArray([d.source, d.target], child_link.source as TreeDatum[]))!
        links_to_main.push(child_link)
        links_to_main.push(spouse_link)
        if (spouse_link) child = spouse_link.source as TreeDatum
        else child = (child_link.source as TreeDatum[])[0]
      } else {
        const spouse_link = links_data.find(d => d.target === child && !Array.isArray(d.source))  // spouse link
        if (!spouse_link) break
        links_to_main.push(spouse_link)
        child = spouse_link.source as TreeDatum
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
  return {cards_node_to_main, links_node_to_main}

  function sameArray(arr1: any[], arr2: any[]) {
    return arr1.every(d1 => arr2.some(d2 => d1 === d2))
  }

  function getCardsToMain(first_parent: TreeDatum, links_to_main: Link[]) {
    const all_cards = links_to_main.filter(d => d).reduce((acc: TreeDatum[], d) => {
      if (Array.isArray(d.target)) acc.push(...d.target)
      else acc.push(d.target)
      if (Array.isArray(d.source)) acc.push(...d.source)
      else acc.push(d.source)
      return acc
    }, [])

    const cards_to_main = [main_datum, datum]
    getChildren(first_parent)
    return cards_to_main

    function getChildren(d: TreeDatum) {
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

  function getChildLinkFromAncestrySide(child_links: Link[], main_datum: TreeDatum) {
    if (child_links.length === 0) return null
    else if (child_links.length === 1) return child_links[0]
    else {
      // siblings of main
      // should be last level where we go to the main and not its siblings
      return child_links.find(d => d.source === main_datum)
    }
  }
}