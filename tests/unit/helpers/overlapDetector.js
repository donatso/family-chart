/**
 * Detects overlapping nodes and link-card intersections in a laid-out tree.
 */

const DEFAULT_CARD_DIM = { w: 220, h: 70 }

/**
 * Get the axis-aligned bounding box for a node, accounting for scale.
 * Cards are centered on (x, y) and scaled.
 */
export function getNodeBBox(node, card_dim = DEFAULT_CARD_DIM) {
  const s = node.scale || 1
  const hw = (card_dim.w * s) / 2
  const hh = (card_dim.h * s) / 2
  return {
    left: node.x - hw,
    right: node.x + hw,
    top: node.y - hh,
    bottom: node.y + hh,
    node
  }
}

/**
 * Check if two axis-aligned bounding boxes overlap.
 * Uses a small margin to allow touching edges.
 */
export function boxesOverlap(a, b, margin = 0) {
  return (
    a.left - margin < b.right &&
    a.right + margin > b.left &&
    a.top - margin < b.bottom &&
    a.bottom + margin > b.top
  )
}

/**
 * Find ALL overlapping pairs in a tree.
 * Returns array of { nodeA, nodeB, overlapArea } objects.
 */
export function findAllOverlaps(treeData, card_dim = DEFAULT_CARD_DIM, margin = 0) {
  const overlaps = []
  const boxes = treeData.map(d => getNodeBBox(d, card_dim))

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      if (boxesOverlap(boxes[i], boxes[j], margin)) {
        const overlapX = Math.min(boxes[i].right, boxes[j].right) - Math.max(boxes[i].left, boxes[j].left)
        const overlapY = Math.min(boxes[i].bottom, boxes[j].bottom) - Math.max(boxes[i].top, boxes[j].top)
        const overlapArea = Math.max(0, overlapX) * Math.max(0, overlapY)

        overlaps.push({
          nodeA: treeData[i],
          nodeB: treeData[j],
          overlapArea,
          boxA: boxes[i],
          boxB: boxes[j]
        })
      }
    }
  }
  return overlaps
}

/**
 * Format overlap info for readable test failure messages.
 */
export function formatOverlaps(overlaps) {
  return overlaps.map(o => {
    const idA = o.nodeA.data?.id || '?'
    const idB = o.nodeB.data?.id || '?'
    const nameA = o.nodeA.data?.data?.['first name'] || idA
    const nameB = o.nodeB.data?.data?.['first name'] || idB
    const scaleA = (o.nodeA.scale || 1).toFixed(2)
    const scaleB = (o.nodeB.scale || 1).toFixed(2)
    return `  "${nameA}" (${idA}, scale=${scaleA}) at (${o.nodeA.x.toFixed(1)}, ${o.nodeA.y.toFixed(1)}) ↔ "${nameB}" (${idB}, scale=${scaleB}) at (${o.nodeB.x.toFixed(1)}, ${o.nodeB.y.toFixed(1)}) — overlap area: ${o.overlapArea.toFixed(1)}px²`
  }).join('\n')
}

/**
 * Check if a line segment intersects an AABB.
 * Line from (x1,y1) to (x2,y2), box = {left, right, top, bottom}.
 */
export function lineIntersectsBox(x1, y1, x2, y2, box) {
  // Cohen-Sutherland-style clipping test
  function code(x, y) {
    let c = 0
    if (x < box.left) c |= 1
    else if (x > box.right) c |= 2
    if (y < box.top) c |= 4
    else if (y > box.bottom) c |= 8
    return c
  }

  let c1 = code(x1, y1), c2 = code(x2, y2)
  if ((c1 & c2) !== 0) return false  // both outside same side
  if ((c1 | c2) === 0) return true   // both inside

  // Full Cohen-Sutherland clipping
  let ax = x1, ay = y1, bx = x2, by = y2
  for (let i = 0; i < 4; i++) {
    let ca = code(ax, ay), cb = code(bx, by)
    if ((ca & cb) !== 0) return false
    if ((ca | cb) === 0) return true

    const c = ca !== 0 ? ca : cb
    let x, y
    if (c & 8) { x = ax + (bx - ax) * (box.bottom - ay) / (by - ay); y = box.bottom }
    else if (c & 4) { x = ax + (bx - ax) * (box.top - ay) / (by - ay); y = box.top }
    else if (c & 2) { y = ay + (by - ay) * (box.right - ax) / (bx - ax); x = box.right }
    else { y = ay + (by - ay) * (box.left - ax) / (bx - ax); x = box.left }

    if (c === ca) { ax = x; ay = y }
    else { bx = x; by = y }
  }
  return true
}

/**
 * Check if a link path passes through any card it shouldn't.
 * linkPoints: array of [x,y] coordinate pairs forming the link path.
 * The link connects two nodes — it's expected to touch/overlap with those endpoint nodes.
 * Returns cards that are improperly intersected.
 */
export function findLinkCardIntersections(linkPoints, treeData, endpointIds, card_dim = DEFAULT_CARD_DIM) {
  const intersections = []
  const boxes = treeData.map(d => ({ ...getNodeBBox(d, card_dim), id: d.data.id }))
  const endpointSet = new Set(endpointIds)

  for (let i = 0; i < linkPoints.length - 1; i++) {
    const [x1, y1] = linkPoints[i]
    const [x2, y2] = linkPoints[i + 1]

    for (const box of boxes) {
      if (endpointSet.has(box.id)) continue // skip endpoints
      if (lineIntersectsBox(x1, y1, x2, y2, box)) {
        intersections.push({ linkSegment: i, cardId: box.id, box })
      }
    }
  }

  return intersections
}

/**
 * Quick summary stats for a laid-out tree.
 */
export function treeStats(treeData) {
  const scales = treeData.map(d => d.scale || 1)
  const xs = treeData.map(d => d.x)
  const ys = treeData.map(d => d.y)
  return {
    nodeCount: treeData.length,
    minScale: Math.min(...scales),
    maxScale: Math.max(...scales),
    xRange: Math.max(...xs) - Math.min(...xs),
    yRange: Math.max(...ys) - Math.min(...ys),
    fractalDepths: [...new Set(treeData.map(d => d.fractal_depth || 0))].sort()
  }
}
