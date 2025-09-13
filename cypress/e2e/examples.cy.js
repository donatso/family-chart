import { LOCAL_HOST, basicF3Tests } from './utils'

describe('Examples', () => {
  const example_routes = [
    { path: '/examples/1-basic-tree' },
    { path: '/examples/2-basic-tree-aristotle' },
    { path: '/examples/3-custom-tree-card' },
    { path: '/examples/4-custom-main-node' },
    { path: '/examples/5-custom-text-display' },
    { path: '/examples/6-html-cards' },
    { path: '/examples/7-custom-elements-and-actions' },
    { path: '/examples/8-zoom-to-card' },
    { path: '/examples/9-big-tree' },
    { path: '/examples/11-html-card-styling' },
    { path: '/examples/12-single-parent' },
    { path: '/examples/13-horizontal-tree' },
    { path: '/examples/14-sort-children-function' },
    { path: '/examples/15-trim-tree' },

    { path: '/examples/v2/1-basic-tree' },
    { path: '/examples/v2/2-basic-tree-aristotle' },
    { path: '/examples/v2/3-custom-tree-card' },
    { path: '/examples/v2/4-custom-main-node' },
    { path: '/examples/v2/5-custom-text-display' },
    { path: '/examples/v2/6-svg-cards' },
    { path: '/examples/v2/7-svg-cards-edit' },
    { path: '/examples/v2/8-custom-elements-and-actions' },
    { path: '/examples/v2/9-zoom-to-card' },
    { path: '/examples/v2/10-big-tree' },
    { path: '/examples/v2/11-card-styling' },
    { path: '/examples/v2/12-single-parent' },
    { path: '/examples/v2/13-horizontal-tree' },
    { path: '/examples/v2/14-sort-children-function' },
    { path: '/examples/v2/15-trim-tree' },
    { path: '/examples/v2/16-default-card-icons' },
    { path: '/examples/v2/17-edit-tree' },
    { path: '/examples/v2/18-edit-tree-get-data-on-change' },
  ]

  before(() => {
    checkIfAllExamplesAreTested()
  })
  
  example_routes.forEach((route, route_index) => {
    it(`Test example with html: ${route.path}`, () => {
      const html_path = getHtmlPath(route.path)
      cy.visit(html_path)
      cy.url().should('include', html_path)
      const card_n = route.card_n || 3
      
      basicF3Tests(card_n)
    })
  })

  function checkIfAllExamplesAreTested() {

  }

  function getHtmlPath(path) {
    return LOCAL_HOST  + path.replace('/examples/', '/examples/htmls/')
  }
})
