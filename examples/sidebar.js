
export default function () {
  const routes = [
  [
    "1-basic-tree",
    "/examples/htmls/1-basic-tree"
  ],
  [
    "2-basic-tree-aristotle",
    "/examples/htmls/2-basic-tree-aristotle"
  ],
  [
    "3-custom-tree-card",
    "/examples/htmls/3-custom-tree-card"
  ],
  [
    "4-custom-main-node",
    "/examples/htmls/4-custom-main-node"
  ],
  [
    "5-custom-text-display",
    "/examples/htmls/5-custom-text-display"
  ],
  [
    "6-html-cards",
    "/examples/htmls/6-html-cards"
  ],
  [
    "7-custom-elements-and-actions",
    "/examples/htmls/7-custom-elements-and-actions"
  ],
  [
    "8-zoom-to-card",
    "/examples/htmls/8-zoom-to-card"
  ],
  [
    "9-big-tree",
    "/examples/htmls/9-big-tree"
  ],
  [
    "11-html-card-styling",
    "/examples/htmls/11-html-card-styling"
  ],
  [
    "12-single-parent",
    "/examples/htmls/12-single-parent"
  ],
  [
    "13-horizontal-tree",
    "/examples/htmls/13-horizontal-tree"
  ],
  [
    "14-sort-children-function",
    "/examples/htmls/14-sort-children-function"
  ],
  [
    "15-trim-tree",
    "/examples/htmls/15-trim-tree"
  ],
  [
    "v2/1-basic-tree",
    "/examples/htmls/v2/1-basic-tree"
  ],
  [
    "v2/2-basic-tree-aristotle",
    "/examples/htmls/v2/2-basic-tree-aristotle"
  ],
  [
    "v2/3-custom-tree-card",
    "/examples/htmls/v2/3-custom-tree-card"
  ],
  [
    "v2/4-custom-main-node",
    "/examples/htmls/v2/4-custom-main-node"
  ],
  [
    "v2/5-custom-text-display",
    "/examples/htmls/v2/5-custom-text-display"
  ],
  [
    "v2/6-svg-cards",
    "/examples/htmls/v2/6-svg-cards"
  ],
  [
    "v2/7-svg-cards-edit",
    "/examples/htmls/v2/7-svg-cards-edit"
  ],
  [
    "v2/8-custom-elements-and-actions",
    "/examples/htmls/v2/8-custom-elements-and-actions"
  ],
  [
    "v2/9-zoom-to-card",
    "/examples/htmls/v2/9-zoom-to-card"
  ],
  [
    "v2/10-big-tree",
    "/examples/htmls/v2/10-big-tree"
  ],
  [
    "v2/11-card-styling",
    "/examples/htmls/v2/11-card-styling"
  ],
  [
    "v2/12-single-parent",
    "/examples/htmls/v2/12-single-parent"
  ],
  [
    "v2/13-horizontal-tree",
    "/examples/htmls/v2/13-horizontal-tree"
  ],
  [
    "v2/14-sort-children-function",
    "/examples/htmls/v2/14-sort-children-function"
  ],
  [
    "v2/15-trim-tree",
    "/examples/htmls/v2/15-trim-tree"
  ],
  [
    "v2/16-default-card-icons",
    "/examples/htmls/v2/16-default-card-icons"
  ],
  [
    "v2/17-edit-tree",
    "/examples/htmls/v2/17-edit-tree"
  ],
  [
    "v2/18-edit-tree-get-data-on-change",
    "/examples/htmls/v2/18-edit-tree-get-data-on-change"
  ]
]

  const sidebarHtml = routes.map(route => `
    <div style="padding: 10px;background-color: ${document.querySelector('title').textContent === route[0] ? 'rgb(66,66,66)' : ''};">
      <a style="color: #fff;" href="${route[1]}">${route[0]}</a>
    </div>
  `).join('\n')

  const rootCont = document.createElement('div')
  rootCont.style.display = 'flex'
  rootCont.style.flexDirection = 'row'
  rootCont.style.gap = '2px'
  rootCont.style.width = '100%'
  rootCont.style.height = '100%'
  document.body.appendChild(rootCont)

  const sideCont = document.createElement('div')
  sideCont.style = 'width: 300px; height: 90vh; background-color: rgb(33,33,33); color: #fff; overflow-y: auto;'
  rootCont.appendChild(sideCont)

  const cont = document.querySelector("#FamilyChart")
  cont.style.height = '90vh'
  rootCont.appendChild(cont)

  sideCont.innerHTML = sidebarHtml
}
  