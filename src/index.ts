import CalculateTree from "./layout/calculate-tree"
import createStore from "./store/store"
import view from "./renderers/view"
import createSvg from "./renderers/svg"
import * as handlers from './handlers'
import * as elements from './elements'
import * as htmlHandlers from './renderers/html'
import * as icons from './renderers/icons'
import createChart from './core/chart'

import CardSvg from './core/cards/card-svg'
import CardHtml from './core/cards/card-html'

export interface FamilyChartAPI {
  CalculateTree: typeof CalculateTree,
  createStore: typeof createStore,
  view: typeof view,
  createSvg: typeof createSvg,
  handlers: typeof handlers,
  elements: typeof elements,
  htmlHandlers: typeof htmlHandlers,
  icons: typeof icons,
  createChart: typeof createChart,
  CardSvg: typeof CardSvg,
  CardHtml: typeof CardHtml,
}

const api: FamilyChartAPI = {
  CalculateTree,
  createStore,
  view,
  createSvg,
  handlers,
  elements,
  htmlHandlers,
  icons,
  createChart,
  CardSvg,
  CardHtml,
}

export default api
