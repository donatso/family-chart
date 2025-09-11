import * as d3 from "d3"
import * as icons from "../renderers/icons"
import { Store } from "../types/store"
import { Data } from "../types/data"

interface HistoryData extends Data {
  main_id: string
}

export interface History {
  changed: () => void
  back: () => void
  forward: () => void
  canForward: () => boolean
  canBack: () => boolean
}

export interface HistoryControls {
  back_btn: HTMLElement
  forward_btn: HTMLElement
  updateButtons: () => void
  destroy: () => void
}

export interface HistoryWithControls extends History {
  controls: HistoryControls
}

export function createHistory(store: Store, getStoreDataCopy: () => Data, onUpdate: () => void): History {
  let history: HistoryData[] = []
  let history_index = -1
  
  return {
    changed,
    back,
    forward,
    canForward,
    canBack
  }

  function changed() {
    if (history_index < history.length - 1) history = history.slice(0, history_index+1)
    const clean_data = getStoreDataCopy() as HistoryData
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

  function updateData(data: HistoryData) {
    const current_main_id = store.getMainId()
    data = JSON.parse(JSON.stringify(data))
    if (!data.find(d => d.id === current_main_id)) store.updateMainId(data.main_id)
    store.updateData(data)
    onUpdate()
  }
}

export function createHistoryControls(cont: HTMLElement, history: History): HistoryControls {
  const history_controls = d3.select(cont).append("div").attr("class", "f3-history-controls")
  cont.insertBefore(history_controls.node()!, cont.firstChild)
  const back_btn = history_controls.append("button").attr("class", "f3-back-button").on("click", () => {
    history.back()
    updateButtons()
  })
  const forward_btn = history_controls.append("button").attr("class", "f3-forward-button").on("click", () => {
    history.forward()
    updateButtons()
  })

  back_btn.html(icons.historyBackSvgIcon())
  forward_btn.html(icons.historyForwardSvgIcon())

  return {
    back_btn: back_btn.node()!,
    forward_btn: forward_btn.node()!,
    updateButtons,
    destroy
  }

  function updateButtons() {
    back_btn.classed("disabled", !history.canBack())
    forward_btn.classed("disabled", !history.canForward())
    if (!history.canBack() && !history.canForward()) {
      history_controls.style("opacity", 0).style("pointer-events", "none")
    } else {
      history_controls.style("opacity", 1).style("pointer-events", "auto")
    }
  }

  function destroy() {
    d3.select(cont).select('.f3-history-controls').remove()
  }
}