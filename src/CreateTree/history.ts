import * as d3 from 'd3';
import {cleanupDataJson} from "./form.js"
import * as icons from "../view/elements/Card.icons.js"
import type { TreeStore, TreeStoreState } from '../createStore.js';
import type { TreePerson } from '../types.js';

export function createHistory(store: TreeStore, getStoreData: () => TreeStoreState, onUpdate: () => unknown) {
  let history: TreeStoreState[] = []
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
    const clean_data: TreeStoreState = JSON.parse(JSON.stringify(getStoreData())) // TODO There are better ways to do this now in latest browsers
    clean_data.main_id = store.getMainId()
    history.push(clean_data)
    history_index++
  }

  function back() {
    if (!canBack()) return
    history_index--
    updateData(history[history_index]!)
  }

  function forward() {
    if (!canForward()) return
    history_index++
    updateData(history[history_index]!)
  }

  function canForward() {
    return history_index < history.length - 1
  }

  function canBack() {
    return history_index > 0
  }

  function updateData(data: TreeStoreState) {
    store.updateMainId(data.main_id)
    store.updateData(data.data)
    onUpdate()
  }
}

export function createHistoryControls(cont: d3.BaseType , history: ReturnType<typeof createHistory>, onUpdate=()=>{}) {
  let _history: ReturnType<typeof createHistory> | null  = history
  const history_controls = d3.select(cont).append("div").attr("class", "f3-history-controls")
  const back_btn = history_controls.append("button").attr("class", "f3-back-button").on("click", () => {
    _history?.back()
    updateButtons()
    onUpdate()
  })
  const forward_btn = history_controls.append("button").attr("class", "f3-forward-button").on("click", () => {
    _history?.forward()
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
    back_btn.classed("disabled", !_history?.canBack())
    forward_btn.classed("disabled", !_history?.canForward())
    const v = !_history?.canBack() && !_history?.canForward() ? "none" : null
    if(v === null){
      history_controls.style("display", null)
    }
    else {
      history_controls.style("display", v)
    }
    
  }

  function destroy() {
    _history = null
    d3.select(cont).select('.f3-history-controls').remove()
  }
}