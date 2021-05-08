export default function ViewAddEventListeners(store) {
  store.state.cont.querySelector(".main_svg").addEventListener("click", e => {
    const node = e.target
    const listeners = [
      ...(store.state.custom_elements || [])
    ],
      isClicked = (query) => node.closest(query)

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      if (!listener.query || !isClicked(listener.query)) continue

      e.stopPropagation();
      const card = node.closest('.card'),
        d_id = card.getAttribute("data-id"),
        d = store.getTree().data.find(d => d.data.id === d_id)
      listener.lis(store, {card, d_id, d})
    }
  })

}
