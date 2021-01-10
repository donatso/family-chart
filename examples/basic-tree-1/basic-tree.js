fetch("./data.json").then(r => r.json()).then(data => {
  const store = f3.createStore({data}),
    view = f3.d3AnimationView({
      cont: document.querySelector("#chart"),
      card_display: [d => d.data.label || '', d => d.data.desc || ''],
    })

  view.setEventListeners(store)
  store.setOnUpdate(props => view.update({tree: store.state.tree, ...(props || {})}))
  store.update.tree()
})
