import d3 from "../d3.js"

import {mainToMiddle, setupSvg, treeFit} from "./View.handlers.js"
import {createPath} from "./elements/Link.js"
import {createLinks} from "../CalculateTree/createLinks.js"
import Card from "./elements/Card.js"
import {calculateEnterAndExitPositions, isAllRelativeDisplayed} from "../CalculateTree/CalculateTree.handlers.js"
import ViewAddEventListeners from "./View.EventListeners.js"

export default function d3AnimationView(store) {
  const svg = createSvg();
  setupSvg(svg);
  setEventListeners()

  return {update: updateView}

  function updateView({tree_position='fit', transition_time=2000}) {
    const tree = store.state.tree,
      view = d3.select(svg).select(".view")

    updateCards();
    updateLinks();
    if (tree_position === 'fit') treeFit({svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time})
    else if (tree_position === 'main_to_middle') mainToMiddle({datum: tree.data[0], svg, svg_dim: svg.getBoundingClientRect(), transition_time})
    else if (tree_position === 'inherit') {}

    function updateLinks() {
      const links_data = tree.data.reduce((acc, d) => acc.concat(createLinks({d, tree:tree.data})), []),
        link = view.select(".links_view").selectAll("path.link").data(links_data, d => d.id),
        link_exit = link.exit(),
        link_enter = link.enter().append("path").attr("class", "link"),
        link_update = link_enter.merge(link)

      link_exit.each(linkExit)
      link_enter.each(linkEnter)
      link_update.each(linkUpdate)

      function linkEnter(d) {
        d3.select(this).attr("fill", "none").attr("stroke", "#fff").style("opacity", 0)
          .attr("d", createPath(d, true))
      }

      function linkUpdate(d) {
        const path = d3.select(this);
        path.transition('path').duration(transition_time).attr("d", createPath(d)).style("opacity", 1)
      }

      function linkExit(d) {
        const path = d3.select(this);
        path.transition('op').duration(800).style("opacity", 0)
        path.transition('path').duration(transition_time).attr("d", createPath(d, true))
          .on("end", () => path.remove())
      }

    }

    function updateCards() {
      const card = view.select(".cards_view").selectAll("g.card_cont").data(tree.data, d => d.data.id),
        card_exit = card.exit(),
        card_enter = card.enter().append("g").attr("class", "card_cont"),
        card_update = card_enter.merge(card)

      card_exit.each(d => calculateEnterAndExitPositions(d, false, true))
      card_enter.each(d => calculateEnterAndExitPositions(d, true, false))

      card_exit.each(cardExit)
      card.each(cardUpdateNoEnter)
      card_enter.each(cardEnter)
      card_update.each(cardUpdate)

      function cardEnter(d) {
        d3.select(this)
          .attr("transform", `translate(${d._x}, ${d._y})`)
          .style("opacity", 0)
          .html(CardHtml(d))
      }

      function cardUpdateNoEnter(d) {}

      function cardUpdate(d) {
        d3.select(this).html(CardHtml(d))
        d3.select(this).transition().duration(transition_time).attr("transform", `translate(${d.x}, ${d.y})`).style("opacity", 1)
      }

      function cardExit(d) {
        const g = d3.select(this)
        g.transition().duration(transition_time).style("opacity", 0).attr("transform", `translate(${d._x}, ${d._y})`)
          .on("end", () => g.remove())
      }

      function CardHtml(d) {
        const show_mini_tree = store.state.mini_tree && !isAllRelativeDisplayed(d, tree.data)
        return Card({
          d,
          card_display: store.state.card_display,
          card_dim: store.state.card_dim,
          show_mini_tree: show_mini_tree,
          show_edit: store.state.edit,
          show_add: store.state.add,
          show_hide_rels: store.state.hide_rels,
          custom_elements: store.state.custom_elements
        }).template
      }
    }

  }

  function createSvg() {
    const svg_dim = store.state.cont.getBoundingClientRect(),
      card_dim = store.state.card_dim,
      svg_html = (`
        <svg class="main_svg">
          <defs>
            <linearGradient id="fadeGrad">
              <stop offset="0.9" stop-color="white" stop-opacity="0"/>
              <stop offset=".91" stop-color="white" stop-opacity=".5"/>
              <stop offset="1" stop-color="white" stop-opacity="1"/>
            </linearGradient>
        
            <mask id="fade" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#fadeGrad)"/></mask>
            <clipPath id="card_text_clip"><rect width="${card_dim.w-card_dim.text_x-10}" height="${card_dim.h-10}"></rect></clipPath>
            <clipPath id="card_image_clip"><rect width="${card_dim.img_w}" height="${card_dim.img_h}" rx="5" ry="5"></rect></clipPath>
          </defs>
          <rect width="${svg_dim.width}" height="${svg_dim.height}" fill="transparent" />
          <g class="view">
            <g class="links_view"></g>
            <g class="cards_view"></g>
          </g>
          <g style="transform: translate(100%, 100%)">
          <g class="fit_screen_icon cursor-pointer" style="transform: translate(-50px, -50px)">
            <rect width="27" height="27" stroke-dasharray="${27/2}" stroke-dashoffset="${27/4}" 
              style="stroke:#fff;stroke-width:4px;fill:transparent;"/>
            <circle r="5" cx="${27/2}" cy="${27/2}" style="fill:#fff" />          
          </g>
          </g>
        </svg>
      `)
    const fake_cont = document.createElement("div")
    fake_cont.innerHTML = svg_html
    const svg = fake_cont.firstElementChild
    store.state.cont.appendChild(svg)

    return svg
  }

  function setEventListeners() {
    svg.querySelector(".fit_screen_icon").addEventListener("click", () => store.update.tree())
    ViewAddEventListeners(store);
  }
}