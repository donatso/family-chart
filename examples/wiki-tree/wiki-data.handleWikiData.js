import {props, relative_props, exclusive_props} from "./wiki-data.dict.js"

function getWikiDataLabels(wiki_ids) {
  let url = "https://www.wikidata.org/w/api.php?" +
    "action=wbgetentities&ids=" +
    wiki_ids.slice(0,49).join("|") +  // TODO: get all
    "&callback=?" +
    "&languages=en|hr" +
    "&props=labels|descriptions" +
    "&format=json";

  return new Promise((resolve, reject) => {
    jsonpQuery(url).then(function (json) {
      if (!json.hasOwnProperty("entities")) {
        resolve({})
        return
      }
      resolve(json.entities)
    })
  })

}

function getWikiDatumLbl(datum) {
  let label;
  try {
    label = datum.labels.en.value
  } catch (e) {
    try {
      const lang = Object.keys(datum.labels)[0]
      label = datum.labels[Object.keys(datum.labels)[0]].value + " (" + lang + ")"
    } catch (e) {
      label = "no label"
    }
  }
  return label
}

function getWikiDatumDesc(datum) {
  let label;
  try {
    label = datum.descriptions.en.value
  } catch (e) {
    try {
      const lang = Object.keys(datum.descriptions)[0]
      label = datum.descriptions[Object.keys(datum.descriptions)[0]].value + " (" + lang + ")"
    } catch (e) {
      label = "no description"
    }
  }
  return label
}

export async function isHuman(wiki_id) {
  const data = await getWikiItem(wiki_id),
    instance_of = "P31",
    is_human = "Q5",
    claims = data.entities[wiki_id].claims;
    if (!claims[instance_of]) return false

    return claims[instance_of].map(claim => {
      return (claim.mainsnak && claim.mainsnak.datavalue) ? claim.mainsnak.datavalue.value.id : null;
    }).some(claim_id => claim_id === is_human)
}

export function getWikiItem(wiki_id) {
  const url = "https://www.wikidata.org/w/api.php?" +
    "action=wbgetentities&ids=" +
    wiki_id +
    "&languages=en|hr" +
    "&props=labels|claims|descriptions" +
    "&format=json";

  return jsonpQuery(url)
}

export async function getWikiPersonData({wiki_id, exclude_props=true}) {

  const json = await getWikiItem(wiki_id),
    entity = json.entities[wiki_id]
  if (exclude_props) cleanClaims(entity.claims, exclusive_props)

  return {
    wiki_id,
    label: getWikiDatumLbl(entity),
    desc: getWikiDatumDesc(entity),
    avatar: await getImageUrl(entity),
    claims: await getElementsClaims(entity.claims)
  }

  function cleanClaims(claims, exclusive_props) {
    for (let prop_id in claims) {
      if (!claims.hasOwnProperty(prop_id)) continue
      if (exclusive_props && !exclusive_props.includes(prop_id)) delete claims[prop_id]
    }
  }


  async function getElementsClaims(claims) {
    if (!claims) return [];
    const claims_id = [];
    for (let prop_id in claims) {
      if (!claims.hasOwnProperty(prop_id)) continue

      claims[prop_id].forEach(claim => {
        let rank = claim.rank;
        let claim_id = claim.mainsnak ? (claim.mainsnak.datavalue ? claim.mainsnak.datavalue.value.id : null) : null;
        if (claim_id && rank !== "deprecated") claims_id.push({"prop_id": prop_id, claim_id: claim_id})
      })
    }

    const search_entities_claims = await getWikiDataLabels(claims_id.map(d => d.claim_id));

    return claims_id.map(d => {
      const claim_id = d.claim_id;
      const prop_id = d.prop_id;
      d.wiki_id = claim_id;
      d.label = getWikiDatumLbl(search_entities_claims[claim_id]);
      d.desc = getWikiDatumDesc(search_entities_claims[claim_id]);

      return d
    })
  }

  function getImageUrl(entity) {
    const image_claim = entity.claims[props.image];
    return new Promise(function(resolve, reject) {
      if(!image_claim || !image_claim[0].mainsnak.datavalue) resolve(null)
      const image_name = image_claim[0].mainsnak.datavalue.value;
      jsonpQuery('https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=File:' + image_name)
        .then(function(response) {
          const wikimedia_first_page = response.query.pages[Object.keys(response.query.pages)[0]]
          if (wikimedia_first_page.imageinfo) resolve(wikimedia_first_page.imageinfo[0].url);
          else resolve(null)
        })
    })
  }
}

export async function getFamilyDataForItem(wiki_stash, wiki_id, level) {
  const stashed_datum = wiki_stash.find(d => d.wiki_id === wiki_id),
    datum = stashed_datum || await getWikiPersonData({wiki_id}),
    rels_id = datum.claims.filter(d => relative_props.includes(d.prop_id)).map(d => d.wiki_id)
  wiki_stash.push(datum)

  if (level === 0) return wiki_stash
  else return new Promise(resolve => {
    let rels_to_load = 0;
    for (let i = 0; i < rels_id.length; i++) {
      const rel_id = rels_id[i];
      if (wiki_stash.find(d => d.wiki_id === rel_id)) continue
      rels_to_load+=1;
      getFamilyDataForItem(wiki_stash, rel_id, level-1).then(() => {rels_to_load-=1; if (rels_to_load === 0) resolve(wiki_stash)})
    }
    if (rels_to_load === 0) resolve(wiki_stash)
  })

}

export function getWikiDataElementByStr(text_substr) {
  const url_temp = "https://www.wikidata.org/w/api.php?action=wbsearchentities&callback=?&format=json&language=en&type=item&continue={search_continue}&search={text_substr}",
     data = [];

  return new Promise((resolve, reject) => {

    (async () => {
      for (let i = 0; i < 1; i++) {
        await getRes(i*7)
      }
      resolve(data)
    })();

  })

  function getRes(iter) {
    let url_query = url_temp.replace("{search_continue}", iter).replace("{text_substr}", text_substr)
    return jsonpQuery(url_query).then(function (json) {
      json.search.forEach(datum => {
        data.push( {
          key: datum.label,
          desc: datum.description,
          datum: {
            label: datum.label,
            wiki_id: datum.id,
          }
        })
      })

    })
  }

}

function jsonpQuery(url) {
  return new Promise(resolve => {
    if (!window.jsonpQuery) window.jsonpQuery = {}
    const q_id = '_'+new Date().getTime()+Math.floor(10000*Math.random())
    window.jsonpQuery[q_id] = function (data) {
      resolve(data)
      // cleanup
      delete window.jsonpQuery[q_id]
      document.querySelector('#'+q_id).remove()
    }

    const script = document.createElement('script');
    script.setAttribute('id', q_id)
    script.src = url+'&callback=jsonpQuery.q_id'.replace('q_id', q_id)

    document.getElementsByTagName('head')[0].appendChild(script);
  })
}



