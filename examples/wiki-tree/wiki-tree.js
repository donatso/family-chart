import {setupWikiSearch} from "./wiki-data.search.js"


(() => {
  const store = f3.createStore({data: null}),
    view = f3.d3AnimationView({
      cont: document.querySelector("#chart"),
      card_display: [d => d.data.label || '', d => d.data.desc || ''],
      edit: false,
      add: false,
      hide_rels: true
    }),
    onUpdate = (props) => {
      view.update({tree: store.state.tree, ...(props || {})});
    }
  setupWikiSearch(store, document.querySelector("#chart"))

  store.setOnUpdate(onUpdate)
  view.setEventListeners(store)

})();
