import d3 from "../d3.js"
import {cleanupDataJson} from "./form.js"
import * as icons from "../view/elements/Card.icons.js"

export function createHistory(store, getStoreData, onUpdate) {
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
    const clean_data = JSON.parse(cleanupDataJson(JSON.stringify(getStoreData())))
    clean_data.main_id = store.getMainId()
    history.push(clean_data)
    history_index++
  }

  function back() {
    if (!canBack()) return
    history_index--
    updateData(history[history_index])
  }

  function forward() {
    if (!canForward()) return
    history_index++
    updateData(history[history_index])
  }

  function canForward() {
    return history_index < history.length - 1
  }

  function canBack() {
    return history_index > 0
  }

  function updateData(data) {
    store.updateMainId(data.main_id)
    store.updateData(data)
    onUpdate()
  }
}

export function createHistoryControls(cont, history, onUpdate=()=>{}) {
  const history_controls = d3.select(cont).append("div").attr("class", "f3-history-controls")
  const back_btn = history_controls.append("button").attr("class", "f3-back-button").on("click", () => {
    history.back()
    updateButtons()
    onUpdate()
  })
  const forward_btn = history_controls.append("button").attr("class", "f3-forward-button").on("click", () => {
    history.forward()
    updateButtons()
    onUpdate()
  })

  back_btn.html(icons.historyBackSvgIcon())
  forward_btn.html(icons.historyForwardSvgIcon())

  return {
    back_btn: back_btn.node(),
    forward_btn: forward_btn.node(),
    updateButtons,
    destroy
  }

  function updateButtons() {
    back_btn.classed("disabled", !history.canBack())
    forward_btn.classed("disabled", !history.canForward())
    history_controls.style("display", !history.canBack() && !history.canForward() ? "none" : null)
  }

  function destroy() {
    history = null
    d3.select(cont).select('.f3-history-controls').remove()
  }
}