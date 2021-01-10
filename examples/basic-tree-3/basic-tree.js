fetch("./data.json").then(r => r.json()).then(data => {
  const store = f3.createStore({data, calculate_props: {}}),
    view = f3.d3AnimationView({
      cont: document.querySelector("#chart"),
      card_display: [d => d.data.label || '', d => d.data.desc || ''],
      card_dim: {w:220}
    })

  view.setEventListeners(store)
  store.setOnUpdate(props => view.update({tree: store.state.tree, ...(props || {})}))
  store.setCalcProps({node_separation: 250, level_separation: 150})
  store.update.tree()
})
