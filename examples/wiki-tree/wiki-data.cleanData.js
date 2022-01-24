import {getFamilyDataForItem} from './wiki-data.handleWikiData.js';
import {props} from './wiki-data.dict.js';

export async function getFamilyTreeFromWikidata(wiki_stash, wiki_id) {
  const data_wd = await getFamilyDataForItem(wiki_stash, wiki_id, 2)
  return {wiki_stash, data: childrenToParentsFix(parentsToSpousesFix(wdToFamilyTree(data_wd)))}
}

function wdToFamilyTree(data_wd) {
  return data_wd.map(wdItemToFtItem)

  function wdItemToFtItem(datum) {
    const first_name = get(props.first_name, "labels"),
      last_name = get(props.last_name, "labels"),
      gender = get(props.gender, "id"),
      father = get(props.father, "id"),
      mother = get(props.mother, "id"),
      spouses = get(props.spouse, "ids"),
      children = get(props.child, "ids"),
      ft_datum = {
        id: datum.wiki_id,
        data: {fn: first_name, ln: last_name, desc: datum.desc, label: datum.label, avatar: datum.avatar},
        rels: {}
      }

    if (gender === props.male || gender === props.female) ft_datum.data.gender = gender === props.male ? "M" : "F"
    if (father && data_wd.find(d => d.wiki_id === father)) ft_datum.rels.father = father
    if (mother && data_wd.find(d => d.wiki_id === mother)) ft_datum.rels.mother = mother
    ft_datum.rels.spouses = spouses.filter(d_id => data_wd.find(d => d.wiki_id === d_id))
    ft_datum.rels.spouses = [...new Set(ft_datum.rels.spouses)]  // if its remarried there are 2 entries
    ft_datum.rels.children = children.filter(d_id => data_wd.find(d => d.wiki_id === d_id))

    return ft_datum

    function get(prop, type) {
      return type === "id"
        ? (datum.claims.find(d => d.prop_id === prop) || {}).wiki_id
        : type === "ids"
          ? datum.claims.filter(d => d.prop_id === prop).map(d => d.wiki_id)
          : type === "labels"
            ? datum.claims.filter(d => d.prop_id === prop).map(d => d.label).join(" ")
            : null
    }
  }
}

function parentsToSpousesFix(data) {
  data.forEach(datum => {
    const r = datum.rels;
    if (!r.mother || !r.father) return
    const p1 = data.find(d => d.id === r.mother),
      p2 = data.find(d => d.id === r.father)
    if (!p1.rels.spouses.includes(p2.id)) p1.rels.spouses.push(p2.id)
    if (!p2.rels.spouses.includes(p1.id)) p2.rels.spouses.push(p1.id)
  })

  return data
}

function childrenToParentsFix(data) {
  data.forEach(datum => {
    const r = datum.rels;
    if (!r.children) return
    r.children.forEach(ch_id => {
      const child = data.find(d => d.id === ch_id)
      if (datum.data.gender === 'F' && !child.rels.mother) child.rels.mother = datum.id;
      if (datum.data.gender === 'M' && !child.rels.father) child.rels.father = datum.id;
    })

    r.children = r.children.filter(ch_id => {
      const child = data.find(d => d.id === ch_id)
      if (datum.data.gender === 'F' && child.rels.mother && child.rels.mother !== datum.id) return false
      else if (datum.data.gender === 'M' && child.rels.father && child.rels.father !== datum.id) return false
      else return true
    })
  })

  return data
}
