import {cleanupDataJson} from "./form.js"

export function createHistory(store, onUpdate) {
  let history = []
  let history_index = -1
  
  return {
    changed,
    back,
    forward,
    canForward,
    canBack
  }

  function changed() {
    if (history_index < history.length - 1) history = history.slice(0, history_index)
    const clean_data = JSON.parse(cleanupDataJson(JSON.stringify(store.getData())))
    history.push(clean_data)
    history_index++
  }

  function back() {
    if (!canBack()) return
    history_index--
    store.updateData(history[history_index])
    onUpdate()

  }

  function forward() {
    if (!canForward()) return
    history_index++
    store.updateData(history[history_index])
    onUpdate()
  }

  function canForward() {
    return history_index < history.length - 1
  }

  function canBack() {
    return history_index > 0
  }
}
