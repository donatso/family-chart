import f3 from '../../src/index.js'
import {setupWikiSearch} from "./wiki-data.search.js"


(() => {
  const store = f3.createStore({
      data: null,
      cont: document.querySelector("#chart"),
      card_display: [d => d.data.label || '', d => d.data.desc || ''],
      edit: false,
      add: false,
      hide_rels: true,
      mini_tree: true,
      card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    }),
    view = f3.d3AnimationView(store),
    onUpdate = (props) => {
      view.update(props || {});
    }
    
  setupWikiSearch(store, document.querySelector("#chart"))
  store.setOnUpdate(onUpdate)
})();
