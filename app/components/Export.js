export function createExportMenu({svg, store}) {
  return {exportSVG, exportPNG}

  function getTreeSvgClone() {
    const tree = store.getTree()
    if (!tree || !tree.dim) return null

    const dim = tree.dim
    const padding = 40

    // Clone the SVG view group
    const viewGroup = svg.querySelector('.view')
    if (!viewGroup) return null

    const clone = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', dim.width + padding * 2)
    clone.setAttribute('height', dim.height + padding * 2)
    clone.setAttribute('viewBox', `0 0 ${dim.width + padding * 2} ${dim.height + padding * 2}`)

    // Create a group with offset to center the tree
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('transform', `translate(${dim.x_off + padding}, ${dim.y_off + padding})`)
    g.innerHTML = viewGroup.innerHTML
    clone.appendChild(g)

    // Inline essential styles
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.textContent = `
      svg { background: #1a2332; font-family: 'Inter', sans-serif; }
      .card-male .card-body-rect, rect.card-male { fill: #5ba3e6; }
      .card-female .card-body-rect, rect.card-female { fill: #e87fa0; }
      .card-genderless .card-body-rect { fill: #7c8a96; }
      .card-body-rect { rx: 8; ry: 8; }
      .card-outline { fill: none; stroke: transparent; stroke-width: 2; }
      .card-main-outline { stroke: #64b5f6; stroke-width: 2.5; }
      .card-new-outline { stroke: rgba(255,255,255,0.5); stroke-dasharray: 4 3; }
      .card_add .card-body-rect { fill: rgba(255,255,255,0.08); stroke: rgba(255,255,255,0.4); stroke-width: 2; stroke-dasharray: 6 4; }
      path.link { stroke: rgba(255,255,255,0.35); stroke-width: 2; fill: none; }
      text { fill: #2c3e50; }
      .text-overflow-mask { fill: transparent; }
    `
    clone.insertBefore(style, clone.firstChild)

    // Add defs from original SVG
    const defs = svg.querySelector('defs')
    if (defs) {
      clone.insertBefore(defs.cloneNode(true), clone.firstChild)
    }

    return clone
  }

  function exportSVG() {
    const clone = getTreeSvgClone()
    if (!clone) return

    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(clone)
    const blob = new Blob([svgStr], {type: 'image/svg+xml;charset=utf-8'})
    downloadBlob(blob, 'family-tree.svg')
    if (window._fcToast) window._fcToast('Exported as SVG')
  }

  function exportPNG() {
    const clone = getTreeSvgClone()
    if (!clone) return

    const w = parseInt(clone.getAttribute('width'))
    const h = parseInt(clone.getAttribute('height'))

    // Scale up for higher resolution
    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)

    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(clone)
    const img = new Image()
    const blob = new Blob([svgStr], {type: 'image/svg+xml;charset=utf-8'})
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      // Draw dark background
      ctx.fillStyle = '#1a2332'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)

      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          downloadBlob(pngBlob, 'family-tree.png')
          if (window._fcToast) window._fcToast('Exported as PNG')
        }
      }, 'image/png')
    }
    img.src = url
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
