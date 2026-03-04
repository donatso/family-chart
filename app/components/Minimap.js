import d3 from '../../src/d3.js'

export function createMinimap({svg, store}) {
  const SIZE_W = 160, SIZE_H = 110
  const workspace = document.querySelector('#workspace')

  const container = document.createElement('div')
  container.className = 'minimap'
  container.innerHTML = `<canvas width="${SIZE_W}" height="${SIZE_H}"></canvas>`
  workspace.appendChild(container)

  const canvas = container.querySelector('canvas')
  const ctx = canvas.getContext('2d')

  let animId = null

  function update() {
    const tree = store.getTree()
    if (!tree || !tree.data || tree.data.length === 0) return

    ctx.clearRect(0, 0, SIZE_W, SIZE_H)

    const dim = tree.dim
    if (!dim) return

    // Compute scale to fit all nodes into the minimap
    const padding = 8
    const availW = SIZE_W - padding * 2
    const availH = SIZE_H - padding * 2
    const scale = Math.min(availW / dim.width, availH / dim.height)
    const offX = padding + (availW - dim.width * scale) / 2
    const offY = padding + (availH - dim.height * scale) / 2

    // Draw nodes as dots
    tree.data.forEach(d => {
      const x = (d.x + dim.x_off) * scale + offX
      const y = (d.y + dim.y_off) * scale + offY
      const r = Math.max(1.5, 3 * (d.scale || 1))

      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      if (d.data.data.gender === 'M') ctx.fillStyle = '#5ba3e6'
      else if (d.data.data.gender === 'F') ctx.fillStyle = '#e87fa0'
      else ctx.fillStyle = '#7c8a96'
      ctx.fill()

      if (d.data.main) {
        ctx.strokeStyle = '#64b5f6'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    })

    // Draw viewport rectangle
    const svgEl = d3.select(svg)
    const transform = d3.zoomTransform(svg)
    const svgRect = svg.getBoundingClientRect()

    // Viewport in tree coordinates
    const vx = (-transform.x / transform.k + dim.x_off) * scale + offX
    const vy = (-transform.y / transform.k + dim.y_off) * scale + offY
    const vw = (svgRect.width / transform.k) * scale
    const vh = (svgRect.height / transform.k) * scale

    ctx.strokeStyle = 'rgba(100, 181, 246, 0.7)'
    ctx.lineWidth = 1
    ctx.strokeRect(vx, vy, vw, vh)
  }

  // Update on zoom/pan
  d3.select(svg).on('zoom.minimap', update)

  // Periodic update to catch tree changes
  function loop() {
    update()
    animId = requestAnimationFrame(loop)
  }
  loop()

  // Click on minimap to navigate
  canvas.addEventListener('click', (e) => {
    const tree = store.getTree()
    if (!tree || !tree.dim) return

    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    const dim = tree.dim
    const padding = 8
    const availW = SIZE_W - padding * 2
    const availH = SIZE_H - padding * 2
    const scale = Math.min(availW / dim.width, availH / dim.height)
    const offX = padding + (availW - dim.width * scale) / 2
    const offY = padding + (availH - dim.height * scale) / 2

    // Convert click to tree coordinates
    const treeX = (cx - offX) / scale - dim.x_off
    const treeY = (cy - offY) / scale - dim.y_off

    // Pan the main SVG to center on this point
    const svgRect = svg.getBoundingClientRect()
    const transform = d3.zoomTransform(svg)
    const newX = svgRect.width / 2 - treeX * transform.k
    const newY = svgRect.height / 2 - treeY * transform.k

    const zoom = svg.__zoomObj
    d3.select(svg).transition().duration(400)
      .call(zoom.transform, d3.zoomIdentity.translate(newX, newY).scale(transform.k))
  })

  return {update, destroy: () => { if (animId) cancelAnimationFrame(animId) }}
}
