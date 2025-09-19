export type * from './types/index'

export { default as calculateTree } from "./layout/calculate-tree"
export { default as createStore } from "./store/store"
export { default as view } from "./renderers/view"
export { default as createSvg } from "./renderers/svg"
export * as handlers from './handlers'
export * as elements from './elements'
// export * as htmlHandlers from './renderers/html'  // handled in deprecated section
export * as icons from './renderers/icons'
export { default as createChart } from './core/chart'
export { default as cardSvg } from './core/cards/card-svg'
export { default as cardHtml } from './core/cards/card-html'



// deprecated
export { CalculateTree } from "./layout/calculate-tree"

export { Card } from './renderers/card-svg/card-svg'

import cardSvg from './core/cards/card-svg'
import cardHtml from './core/cards/card-html'
/** @deprecated Use cardSvg instead. This export will be removed in a future version. */
export const CardSvg = cardSvg
/** @deprecated Use cardHtml instead. This export will be removed in a future version. */
export const CardHtml = cardHtml
// re-export card types with the new names
export { CardHtml as CardHtmlClass } from './core/cards/card-html'
export { CardSvg as CardSvgClass } from './core/cards/card-svg'

import * as htmlHandlers from './renderers/html'
import { setupHtmlSvg, setupReactiveTreeData, getUniqueId } from './features/card-component/handlers'
const htmlHandlersWithDeprecated = Object.assign({}, htmlHandlers, {setupHtmlSvg, setupReactiveTreeData, getUniqueId})
export { htmlHandlersWithDeprecated as htmlHandlers }