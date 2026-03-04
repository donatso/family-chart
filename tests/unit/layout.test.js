import { describe, it, expect } from 'vitest'
import CalculateTree from '../../src/CalculateTree/CalculateTree.js'
import { createLinks } from '../../src/CalculateTree/createLinks.js'
import {
  findAllOverlaps,
  formatOverlaps,
  findLinkCardIntersections,
  treeStats,
  getNodeBBox
} from './helpers/overlapDetector.js'
import {
  singlePerson,
  coupleWithChildren,
  linearAncestry,
  linearDescent,
  wideSiblings,
  fullBinaryTree,
  complexTree,
  randomTree,
  manySpouses
} from './helpers/treeGenerator.js'

// ─── Helpers ───

const CARD_DIM = { w: 220, h: 70 }

function layoutTree(data, opts = {}) {
  const deepCopy = JSON.parse(JSON.stringify(data))
  return CalculateTree({
    data_stash: deepCopy,
    main_id: deepCopy[0].id,
    node_separation: opts.node_separation || 250,
    level_separation: opts.level_separation || 150,
    scale_factor: opts.scale_factor || 0.4,
    max_spouse_tree_depth: opts.max_spouse_tree_depth ?? 2,
    is_vertical: true
  })
}

function assertNoOverlaps(data, opts = {}, margin = 0) {
  const tree = layoutTree(data, opts)
  const overlaps = findAllOverlaps(tree.data, CARD_DIM, margin)
  if (overlaps.length > 0) {
    const stats = treeStats(tree.data)
    const msg = `Found ${overlaps.length} overlapping node pair(s) among ${stats.nodeCount} nodes:\n${formatOverlaps(overlaps)}`
    expect(overlaps.length, msg).toBe(0)
  }
  return tree
}

function assertValidLayout(tree) {
  // Every node should have finite coordinates
  for (const d of tree.data) {
    expect(isFinite(d.x), `Node ${d.data.id} has non-finite x: ${d.x}`).toBe(true)
    expect(isFinite(d.y), `Node ${d.data.id} has non-finite y: ${d.y}`).toBe(true)
    expect(d.scale, `Node ${d.data.id} has no scale`).toBeGreaterThan(0)
    expect(d.scale, `Node ${d.data.id} scale too large`).toBeLessThanOrEqual(1)
  }

  // Tree dimensions should be positive and finite
  expect(tree.dim.width).toBeGreaterThan(0)
  expect(tree.dim.height).toBeGreaterThan(0)
  expect(isFinite(tree.dim.width)).toBe(true)
  expect(isFinite(tree.dim.height)).toBe(true)
}

// ─── Test Suites ───

describe('CalculateTree — basic layout validity', () => {
  it('single person produces valid layout', () => {
    const tree = layoutTree(singlePerson())
    assertValidLayout(tree)
    expect(tree.data.length).toBeGreaterThanOrEqual(1)
  })

  it('couple with children produces valid layout', () => {
    const tree = layoutTree(coupleWithChildren(3))
    assertValidLayout(tree)
  })

  it('linear ancestry chain produces valid layout', () => {
    const tree = layoutTree(linearAncestry(5))
    assertValidLayout(tree)
  })

  it('linear descent chain produces valid layout', () => {
    const tree = layoutTree(linearDescent(5))
    assertValidLayout(tree)
  })
})

describe('CalculateTree — no card overlaps', () => {
  it('couple with 2 children: no overlaps', () => {
    assertNoOverlaps(coupleWithChildren(2))
  })

  it('couple with 5 children: no overlaps', () => {
    assertNoOverlaps(coupleWithChildren(5))
  })

  it('couple with 10 children: no overlaps', () => {
    assertNoOverlaps(coupleWithChildren(10))
  })

  it('3-generation ancestry: no overlaps', () => {
    assertNoOverlaps(linearAncestry(3))
  })

  it('5-generation ancestry: no overlaps', () => {
    assertNoOverlaps(linearAncestry(5))
  })

  it('5-generation descent: no overlaps', () => {
    assertNoOverlaps(linearDescent(5))
  })

  it('10 siblings with spouses: no overlaps', () => {
    assertNoOverlaps(wideSiblings(10))
  })

  it('20 siblings with spouses: no overlaps', () => {
    assertNoOverlaps(wideSiblings(20))
  })

  it('binary tree depth 2: no overlaps', () => {
    assertNoOverlaps(fullBinaryTree(2))
  })

  it('binary tree depth 3: no overlaps', () => {
    assertNoOverlaps(fullBinaryTree(3))
  })

  it('many spouses (5): no overlaps', () => {
    assertNoOverlaps(manySpouses(5))
  })

  it('many spouses (10): no overlaps', () => {
    assertNoOverlaps(manySpouses(10))
  })
})

describe('CalculateTree — complex trees with fractal sub-trees', () => {
  it('complex tree with in-law parents: no overlaps', () => {
    assertNoOverlaps(complexTree({
      ancestryDepth: 2,
      progenyDepth: 2,
      siblingsPerLevel: 1,
      spousesWithParents: true
    }))
  })

  it('complex tree deep ancestry: no overlaps', () => {
    assertNoOverlaps(complexTree({
      ancestryDepth: 4,
      progenyDepth: 1,
      siblingsPerLevel: 1,
      spousesWithParents: true
    }))
  })

  it('complex tree deep progeny: no overlaps', () => {
    assertNoOverlaps(complexTree({
      ancestryDepth: 1,
      progenyDepth: 4,
      siblingsPerLevel: 2,
      spousesWithParents: true
    }))
  })

  it('complex tree many siblings: no overlaps', () => {
    assertNoOverlaps(complexTree({
      ancestryDepth: 2,
      progenyDepth: 2,
      siblingsPerLevel: 3,
      spousesWithParents: true
    }))
  })

  it('complex tree without spouse parents: no overlaps', () => {
    assertNoOverlaps(complexTree({
      ancestryDepth: 3,
      progenyDepth: 3,
      siblingsPerLevel: 2,
      spousesWithParents: false
    }))
  })
})

describe('CalculateTree — fractal scaling correctness', () => {
  it('blood relatives have fractal_depth 0', () => {
    const tree = layoutTree(linearAncestry(3))
    const bloodNodes = tree.data.filter(d => !d.added)
    for (const d of bloodNodes) {
      expect(d.fractal_depth, `Blood relative ${d.data.id} should have fractal_depth 0`).toBe(0)
      expect(d.scale).toBe(1)
    }
  })

  it('spouses have fractal_depth > 0', () => {
    const data = coupleWithChildren(2)
    const tree = layoutTree(data)
    const spouseNodes = tree.data.filter(d => d.added && !d.data.to_add)
    for (const d of spouseNodes) {
      expect(d.fractal_depth, `Spouse ${d.data.id} should have fractal_depth >= 1`).toBeGreaterThanOrEqual(1)
      expect(d.scale).toBeLessThan(1)
    }
  })

  it('scale decreases with fractal depth', () => {
    const tree = layoutTree(complexTree({
      ancestryDepth: 1,
      progenyDepth: 2,
      siblingsPerLevel: 1,
      spousesWithParents: true
    }))

    const byDepth = {}
    for (const d of tree.data) {
      const fd = d.fractal_depth || 0
      if (!byDepth[fd]) byDepth[fd] = []
      byDepth[fd].push(d.scale)
    }

    const depths = Object.keys(byDepth).map(Number).sort()
    for (let i = 1; i < depths.length; i++) {
      const prevScale = Math.max(...byDepth[depths[i - 1]])
      const currScale = Math.max(...byDepth[depths[i]])
      expect(currScale, `Scale at depth ${depths[i]} should be less than depth ${depths[i-1]}`).toBeLessThan(prevScale)
    }
  })

  it('spouse ancestry nodes share fractal_depth with their spouse', () => {
    const tree = layoutTree(complexTree({
      ancestryDepth: 1, progenyDepth: 1, siblingsPerLevel: 0, spousesWithParents: true
    }))

    // Find nodes added by setupSpouseAncestry (is_ancestry && added)
    const spouseAncestry = tree.data.filter(d => d.added && d.is_ancestry)
    for (const d of spouseAncestry) {
      // Their fractal_depth should match their child's fractal_depth
      const childNode = tree.data.find(c => c.parents && c.parents.includes(d))
      if (childNode) {
        expect(d.fractal_depth).toBe(childNode.fractal_depth)
      }
    }
  })
})

describe('CalculateTree — level-of-detail thresholds', () => {
  it('nodes at different scales get appropriate fractal_depth', () => {
    const tree = layoutTree(complexTree({
      ancestryDepth: 1, progenyDepth: 1, siblingsPerLevel: 1, spousesWithParents: true
    }), { scale_factor: 0.4 })

    for (const d of tree.data) {
      const expectedScale = Math.pow(0.4, d.fractal_depth || 0)
      expect(d.scale).toBeCloseTo(expectedScale, 5)
    }
  })
})

describe('CalculateTree — stress tests with random trees', () => {
  const sizes = [20, 50, 100, 200]

  for (const size of sizes) {
    it(`random tree ~${size} people: valid layout`, () => {
      const data = randomTree(size)
      const tree = layoutTree(data)
      assertValidLayout(tree)
    })
  }

  for (const size of sizes) {
    it(`random tree ~${size} people: no overlaps`, () => {
      const data = randomTree(size)
      assertNoOverlaps(data)
    })
  }

  // Multiple seeds to catch edge cases
  for (const seed of [1, 7, 42, 99, 256]) {
    it(`random tree seed=${seed}, size=50: no overlaps`, () => {
      assertNoOverlaps(randomTree(50, seed))
    })
  }
})

describe('CalculateTree — extreme cases', () => {
  it('single person: no overlaps', () => {
    assertNoOverlaps(singlePerson())
  })

  it('binary tree depth 4 (~30 nodes): no overlaps', () => {
    assertNoOverlaps(fullBinaryTree(4))
  })

  it('20+ siblings: no overlaps', () => {
    assertNoOverlaps(wideSiblings(25))
  })

  it('deep ancestry (8 generations): no overlaps', () => {
    assertNoOverlaps(linearAncestry(8))
  })

  it('deep descent (8 generations): no overlaps', () => {
    assertNoOverlaps(linearDescent(8))
  })

  it('large random tree ~300 people: no overlaps', () => {
    assertNoOverlaps(randomTree(300, 12345))
  })
})

describe('Link-card intersection tests', () => {
  it('links in basic tree do not pass through unrelated cards', () => {
    const data = coupleWithChildren(3)
    const tree = layoutTree(data)

    for (const d of tree.data) {
      const links = createLinks({ d, tree: tree.data, is_vertical: true })
      for (const link of links) {
        if (!link.d || !Array.isArray(link.d)) continue

        // Extract endpoint node IDs from link id
        const endpointIds = link.id.split(', ')

        const intersections = findLinkCardIntersections(
          link.d, tree.data, endpointIds, CARD_DIM
        )

        if (intersections.length > 0) {
          const cardIds = intersections.map(i => i.cardId).join(', ')
          expect.fail(
            `Link "${link.id}" passes through cards: ${cardIds}`
          )
        }
      }
    }
  })

  it('links in complex tree do not pass through unrelated cards', () => {
    const data = complexTree({
      ancestryDepth: 2, progenyDepth: 2, siblingsPerLevel: 1, spousesWithParents: false
    })
    const tree = layoutTree(data)

    let totalIntersections = 0
    for (const d of tree.data) {
      const links = createLinks({ d, tree: tree.data, is_vertical: true })
      for (const link of links) {
        if (!link.d || !Array.isArray(link.d)) continue
        const endpointIds = link.id.split(', ')
        const intersections = findLinkCardIntersections(
          link.d, tree.data, endpointIds, CARD_DIM
        )
        totalIntersections += intersections.length
      }
    }

    expect(totalIntersections, `Found ${totalIntersections} link-card intersections`).toBe(0)
  })
})

describe('Tree dimension bounds', () => {
  it('all nodes are within tree dim bounds', () => {
    const data = complexTree({
      ancestryDepth: 2, progenyDepth: 2, siblingsPerLevel: 2, spousesWithParents: true
    })
    const tree = layoutTree(data)

    for (const d of tree.data) {
      const box = getNodeBBox(d, CARD_DIM)
      const adjustedLeft = box.left + tree.dim.x_off
      const adjustedRight = box.right + tree.dim.x_off
      const adjustedTop = box.top + tree.dim.y_off
      const adjustedBottom = box.bottom + tree.dim.y_off

      expect(adjustedLeft, `Node ${d.data.id} extends left beyond tree bounds`).toBeGreaterThanOrEqual(-1)
      expect(adjustedTop, `Node ${d.data.id} extends above tree bounds`).toBeGreaterThanOrEqual(-1)
      expect(adjustedRight, `Node ${d.data.id} extends right beyond tree bounds`).toBeLessThanOrEqual(tree.dim.width + 1)
      expect(adjustedBottom, `Node ${d.data.id} extends below tree bounds`).toBeLessThanOrEqual(tree.dim.height + 1)
    }
  })
})
