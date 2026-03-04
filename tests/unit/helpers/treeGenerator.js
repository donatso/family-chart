/**
 * Generates valid family tree data of various shapes and sizes.
 * Each person: { id, data: { gender, "first name" }, rels: { father?, mother?, spouses?, children? } }
 */

let _id = 0
function nextId() { return `p${++_id}` }
function resetIds() { _id = 0 }

function person(id, gender, name) {
  return {
    id,
    data: { gender, 'first name': name || id },
    rels: {}
  }
}

function marry(a, b) {
  if (!a.rels.spouses) a.rels.spouses = []
  if (!b.rels.spouses) b.rels.spouses = []
  a.rels.spouses.push(b.id)
  b.rels.spouses.push(a.id)
}

function addChild(father, mother, child) {
  child.rels.father = father.id
  child.rels.mother = mother.id
  if (!father.rels.children) father.rels.children = []
  if (!mother.rels.children) mother.rels.children = []
  father.rels.children.push(child.id)
  mother.rels.children.push(child.id)
}

/**
 * Minimal tree: single person
 */
export function singlePerson() {
  resetIds()
  return [person('solo', 'M', 'Solo')]
}

/**
 * Couple with N children
 */
export function coupleWithChildren(numChildren) {
  resetIds()
  const dad = person('dad', 'M', 'Father')
  const mom = person('mom', 'F', 'Mother')
  marry(dad, mom)

  const data = [dad, mom]
  for (let i = 0; i < numChildren; i++) {
    const gender = i % 2 === 0 ? 'M' : 'F'
    const child = person(`child_${i}`, gender, `Child ${i}`)
    addChild(dad, mom, child)
    data.push(child)
  }
  return data
}

/**
 * Linear ancestry chain: main -> parents -> grandparents -> ... up to depth
 */
export function linearAncestry(depth) {
  resetIds()
  const data = []
  let currentChild = person('main', 'M', 'Main')
  data.push(currentChild)

  for (let i = 0; i < depth; i++) {
    const dad = person(`dad_${i}`, 'M', `Father Gen${i}`)
    const mom = person(`mom_${i}`, 'F', `Mother Gen${i}`)
    marry(dad, mom)
    addChild(dad, mom, currentChild)
    data.push(dad, mom)
    currentChild = dad // go up the paternal line
  }
  return data
}

/**
 * Linear descent: main -> child -> grandchild -> ... down to depth
 * Each generation has a spouse.
 */
export function linearDescent(depth) {
  resetIds()
  const data = []
  const main = person('main', 'M', 'Main')
  data.push(main)

  let currentParent = main
  for (let i = 0; i < depth; i++) {
    const spouse = person(`sp_${i}`, 'F', `Spouse Gen${i}`)
    marry(currentParent, spouse)
    data.push(spouse)

    const child = person(`child_${i}`, 'M', `Child Gen${i}`)
    addChild(currentParent, spouse, child)
    data.push(child)
    currentParent = child
  }
  return data
}

/**
 * Wide tree: main with N siblings, each sibling has a spouse
 */
export function wideSiblings(numSiblings) {
  resetIds()
  const dad = person('dad', 'M', 'Father')
  const mom = person('mom', 'F', 'Mother')
  marry(dad, mom)

  const main = person('main', 'M', 'Main')
  addChild(dad, mom, main)
  const data = [main, dad, mom]

  for (let i = 0; i < numSiblings; i++) {
    const gender = i % 2 === 0 ? 'F' : 'M'
    const sibling = person(`sib_${i}`, gender, `Sibling ${i}`)
    addChild(dad, mom, sibling)
    data.push(sibling)

    // Give some siblings spouses
    if (i % 2 === 0) {
      const spGender = gender === 'M' ? 'F' : 'M'
      const sp = person(`sib_sp_${i}`, spGender, `SibSpouse ${i}`)
      marry(sibling, sp)
      data.push(sp)
    }
  }
  return data
}

/**
 * Full binary tree: each couple has exactly 2 children, down to given depth.
 * Main is at the top. Creates 2^depth leaf nodes.
 */
export function fullBinaryTree(depth) {
  resetIds()
  const data = []
  const main = person('main', 'M', 'Main')
  const mainSpouse = person('main_sp', 'F', 'MainSpouse')
  marry(main, mainSpouse)
  data.push(main, mainSpouse)

  function buildLevel(father, mother, currentDepth) {
    if (currentDepth >= depth) return

    for (let i = 0; i < 2; i++) {
      const gender = i === 0 ? 'M' : 'F'
      const child = person(nextId(), gender, `D${currentDepth}_C${i}`)
      addChild(father, mother, child)
      data.push(child)

      // Give each child a spouse and recurse
      const spGender = gender === 'M' ? 'F' : 'M'
      const sp = person(nextId(), spGender, `D${currentDepth}_S${i}`)
      marry(child, sp)
      data.push(sp)

      buildLevel(
        gender === 'M' ? child : sp,
        gender === 'F' ? child : sp,
        currentDepth + 1
      )
    }
  }

  buildLevel(main, mainSpouse, 0)
  return data
}

/**
 * Complex tree with both ancestry AND progeny from the main node,
 * plus multiple spouses at various levels.
 */
export function complexTree({ ancestryDepth = 2, progenyDepth = 2, siblingsPerLevel = 1, spousesWithParents = true }) {
  resetIds()
  const data = []
  const main = person('main', 'M', 'Main')
  data.push(main)

  // Build ancestry upward
  let child = main
  for (let i = 0; i < ancestryDepth; i++) {
    const dad = person(`anc_dad_${i}`, 'M', `AncDad${i}`)
    const mom = person(`anc_mom_${i}`, 'F', `AncMom${i}`)
    marry(dad, mom)
    addChild(dad, mom, child)
    data.push(dad, mom)

    // Add siblings at this level
    for (let s = 0; s < siblingsPerLevel; s++) {
      const sib = person(`sib_${i}_${s}`, s % 2 === 0 ? 'F' : 'M', `Sib${i}_${s}`)
      addChild(dad, mom, sib)
      data.push(sib)

      // Give sibling a spouse (this creates in-law sub-trees)
      const sibSp = person(`sib_sp_${i}_${s}`, sib.data.gender === 'M' ? 'F' : 'M', `SibSp${i}_${s}`)
      marry(sib, sibSp)
      data.push(sibSp)

      // Optionally give spouse parents (for fractal sub-tree testing)
      if (spousesWithParents) {
        const spDad = person(`sp_dad_${i}_${s}`, 'M', `SpDad${i}_${s}`)
        const spMom = person(`sp_mom_${i}_${s}`, 'F', `SpMom${i}_${s}`)
        marry(spDad, spMom)
        addChild(spDad, spMom, sibSp)
        data.push(spDad, spMom)
      }
    }

    child = dad
  }

  // Build progeny downward
  let parent = main
  const mainSpouse = person('main_sp', 'F', 'MainSpouse')
  marry(main, mainSpouse)
  data.push(mainSpouse)

  // Give main's spouse parents too
  if (spousesWithParents) {
    const msDad = person('ms_dad', 'M', 'MSPDad')
    const msMom = person('ms_mom', 'F', 'MSPMom')
    marry(msDad, msMom)
    addChild(msDad, msMom, mainSpouse)
    data.push(msDad, msMom)
  }

  let currentFather = main
  let currentMother = mainSpouse
  for (let i = 0; i < progenyDepth; i++) {
    const ch = person(`desc_${i}`, 'M', `Desc${i}`)
    addChild(currentFather, currentMother, ch)
    data.push(ch)

    const chSp = person(`desc_sp_${i}`, 'F', `DescSp${i}`)
    marry(ch, chSp)
    data.push(chSp)

    if (spousesWithParents) {
      const dsDad = person(`ds_dad_${i}`, 'M', `DSDad${i}`)
      const dsMom = person(`ds_mom_${i}`, 'F', `DSMom${i}`)
      marry(dsDad, dsMom)
      addChild(dsDad, dsMom, chSp)
      data.push(dsDad, dsMom)
    }

    currentFather = ch
    currentMother = chSp
  }

  return data
}

/**
 * Random tree: generates a random family tree with approximately `targetSize` people.
 * Uses a seeded PRNG for reproducibility.
 */
export function randomTree(targetSize, seed = 42) {
  resetIds()
  // Simple seeded PRNG (mulberry32)
  let s = seed
  function rand() {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
  function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min }

  const data = []
  const main = person('main', 'M', 'Main')
  data.push(main)

  // Pool of people who can have children added
  const fertile = [main]

  while (data.length < targetSize) {
    if (fertile.length === 0) break
    const parentIdx = randInt(0, fertile.length - 1)
    const parent = fertile[parentIdx]

    // Ensure parent has a spouse
    if (!parent.rels.spouses || parent.rels.spouses.length === 0) {
      const spGender = parent.data.gender === 'M' ? 'F' : 'M'
      const sp = person(nextId(), spGender)
      marry(parent, sp)
      data.push(sp)

      // Sometimes give spouse parents
      if (rand() < 0.3 && data.length + 2 < targetSize) {
        const spDad = person(nextId(), 'M')
        const spMom = person(nextId(), 'F')
        marry(spDad, spMom)
        addChild(spDad, spMom, sp)
        data.push(spDad, spMom)
      }
    }

    // Add 1-3 children
    const numChildren = randInt(1, Math.min(3, targetSize - data.length))
    const spouseId = parent.rels.spouses[0]
    const spouse = data.find(d => d.id === spouseId)
    const father = parent.data.gender === 'M' ? parent : spouse
    const mother = parent.data.gender === 'F' ? parent : spouse

    for (let c = 0; c < numChildren && data.length < targetSize; c++) {
      const gender = rand() < 0.5 ? 'M' : 'F'
      const child = person(nextId(), gender)
      addChild(father, mother, child)
      data.push(child)
      fertile.push(child)
    }

    // Remove parent from fertile pool sometimes to prevent infinite width
    if (rand() < 0.5 || (parent.rels.children && parent.rels.children.length >= 4)) {
      fertile.splice(parentIdx, 1)
    }
  }

  return data
}

/**
 * Worst-case: many spouses on one person (polygamy stress test)
 */
export function manySpouses(numSpouses) {
  resetIds()
  const main = person('main', 'M', 'Main')
  const data = [main]

  for (let i = 0; i < numSpouses; i++) {
    const sp = person(`sp_${i}`, 'F', `Spouse${i}`)
    if (!main.rels.spouses) main.rels.spouses = []
    main.rels.spouses.push(sp.id)
    sp.rels.spouses = [main.id]
    data.push(sp)

    // Each spouse has one child with main
    const child = person(`ch_${i}`, i % 2 === 0 ? 'M' : 'F', `Child${i}`)
    addChild(main, sp, child)
    data.push(child)
  }
  return data
}
