import {getWikiDataElementByStr, isHuman} from "./wiki-data.handleWikiData.js"
import wikidata_peps from "./wikidata_peps.js"
import {getFamilyTreeFromWikidata} from "./wiki-data.cleanData.js"

export function setupWikiSearch(store, cont) {
  let wiki_stash = [];
  Search({
    cont: document.body.insertBefore(document.createElement("div"), document.body.firstElementChild),
    onSelect: updateDataWithWDItem
  })

  onLoad(updateDataWithWDItem);

  function onLoad(updateDataWithWDItem) {
    const wiki_id = new URL(window.location.href).searchParams.get("wiki_id");
    if (wiki_id) updateDataWithWDItem({wiki_id})
  }

  function updateDataWithWDItem({wiki_id}) {
    const loader = insertLoader();
    return getFamilyTreeFromWikidata(wiki_stash, wiki_id)
      .then(d => {
        wiki_stash = d.wiki_stash.slice(0, 500);
        store.updateMainId(d.data.find(d => d.id === wiki_id).id);
        store.updateData(d.data);store.updateTree({initial: true})
      })
      .finally(() => loader.remove())
  }

  function insertLoader() {
    const loader = document.createElement("div")
    loader.setAttribute("class", "lds-roller-cont")
    loader.innerHTML = `<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`
    cont.appendChild(loader)
    return loader
  }
}

function Search({cont, onSelect}) {
  cont.style.position = "relative"
  cont.style.zIndex = "1"
  cont.innerHTML = (`
    <div class="input-field" style="width: 450px; max-width: 85%; margin: auto; position: absolute; top: 13px; left: 0; right: 0">
      <input type="text" id="autocomplete-input" class="autocomplete" style="color: #fff;">
      <label for="autocomplete-input">Search Wikidata</label>
      <div class="lds-roller-input-cont" style="display: none">
        <div class="lds-roller" style="color: #9e9e9e"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
  `)

  const results = wikidata_peps.reduce((acc, d) => {acc[d.humanLabel] = {datum: {wiki_id: d.human.split("/")[d.human.split("/").length-1]}}; return acc}, {}),
    dict_for_autocomplete = Object.keys(results).reduce((acc, k) => {acc[k] = null; return acc}, {}),
    input = cont.querySelector('input'),
    autocomplete = M.Autocomplete.init(input, {data: dict_for_autocomplete, onAutocomplete: key => onSelect(results[key].datum), minLength: 3});

  setupListener()

  function setupListener() {
    let searchTimeout = setTimeout(()=>{})
    addEventListener("input", function (e) {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(search, 300)
    })

    function search() {
      if (input.value.length < 3) return
      autocomplete.el.parentNode.querySelector(".lds-roller-input-cont").style.display = null
      getWikiDataElementByStr(input.value).then(data => {
        autocomplete.el.parentNode.querySelector(".lds-roller-input-cont").style.display = "none"
        data.forEach(d => {
          isHuman(d.datum.wiki_id).then(is => is ? insertHuman(d) : '')
        })
        function insertHuman(d) {
          if (Object.values(results).find(d0 => d0.datum.wiki_id === d.datum.wiki_id)) return
          const key = d.datum.label + (d.desc ? ` (${d.desc})` : '')
          results[key] = d;
          dict_for_autocomplete[key] = null
          autocomplete.updateData(dict_for_autocomplete);
          autocomplete.open()
        }
      })
    }
  }
}
