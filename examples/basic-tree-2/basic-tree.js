
fetch("./data.json").then(r => r.json()).then(data => {
  const tree_data = f3.CalculateTree({data_stash: data}),
    view = f3.d3AnimationView({
      cont: document.querySelector("#chart"),
      card_display: [d => d.data.label || '', d => d.data.desc || ''],
      hide_rels: false,
      mini_tree: false
    })

  view.update({tree: tree_data})
})
