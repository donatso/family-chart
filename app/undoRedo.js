const MAX_HISTORY = 50

export function createUndoRedo(store) {
  const undoStack = []
  const redoStack = []

  function snapshot() {
    const data = store.getData()
    const clone = JSON.parse(JSON.stringify(data.filter(d => !d.to_add).map(d => ({
      id: d.id, data: d.data, rels: d.rels
    }))))
    undoStack.push(clone)
    if (undoStack.length > MAX_HISTORY) undoStack.shift()
    redoStack.length = 0
    updateToolbar()
  }

  function undo() {
    if (undoStack.length === 0) return
    const current = JSON.parse(JSON.stringify(store.getData().filter(d => !d.to_add).map(d => ({
      id: d.id, data: d.data, rels: d.rels
    }))))
    redoStack.push(current)
    const prev = undoStack.pop()
    store.update.data(prev)
    store.update.tree()
    updateToolbar()
  }

  function redo() {
    if (redoStack.length === 0) return
    const current = JSON.parse(JSON.stringify(store.getData().filter(d => !d.to_add).map(d => ({
      id: d.id, data: d.data, rels: d.rels
    }))))
    undoStack.push(current)
    const next = redoStack.pop()
    store.update.data(next)
    store.update.tree()
    updateToolbar()
  }

  function canUndo() { return undoStack.length > 0 }
  function canRedo() { return redoStack.length > 0 }

  function updateToolbar() {
    if (store._updateToolbar) store._updateToolbar()
  }

  return {snapshot, undo, redo, canUndo, canRedo}
}
