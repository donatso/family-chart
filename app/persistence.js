const STORAGE_KEY = 'fc-family-tree-data'

export function createPersistence() {
  let saveTimeout = null

  function save(data) {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      try {
        const serializable = data.filter(d => !d.to_add).map(d => ({
          id: d.id,
          data: d.data,
          rels: d.rels
        }))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
      } catch (e) {
        // localStorage full or unavailable — silently fail
      }
    }, 300)
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      if (!Array.isArray(data) || data.length === 0) return null
      if (!data[0].id || !data[0].rels) return null
      return data
    } catch (e) {
      return null
    }
  }

  function hasData() {
    return !!localStorage.getItem(STORAGE_KEY)
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY)
  }

  return {save, load, hasData, clear}
}
