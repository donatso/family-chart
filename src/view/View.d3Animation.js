import d3 from "../d3.js"

import {mainToMiddle, setupSvg, treeFit} from "./View.handlers.js"
import {createPath} from "./elements/Link.js"
import {createLinks} from "../CalculateTree/createLinks.js"
import Card from "./elements/Card.js"
import {calculateEnterAndExitPositions} from "../CalculateTree/CalculateTree.handlers.js"
import ViewAddEventListeners from "./View.EventListeners.js"
import {isAllRelativeDisplayed} from "../handlers"

export default function d3AnimationView(store) {
  const svg = createSvg();
  setupSvg(svg, store.state.zoom_polite);
  setEventListeners()

  return {update: updateView}

  function updateView(props) {
    if (!props) props = {}
    const tree = store.state.tree,
      view = d3.select(svg).select(".view"),
      tree_position = props.tree_position || 'fit',
      transition_time = props.hasOwnProperty('transition_time') ? props.transition_time : 2000;

    updateCards();
    updateLinks();
    if (tree_position === 'fit') treeFit({svg, svg_dim: svg.getBoundingClientRect(), tree_dim: tree.dim, transition_time})
    else if (tree_position === 'main_to_middle') mainToMiddle({datum: tree.data[0], svg, svg_dim: svg.getBoundingClientRect(), scale: props.scale, transition_time})
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
          .node().appendChild(CardElement(this, d))
      }

      function cardUpdateNoEnter(d) {}

      function cardUpdate(d) {
        this.innerHTML = ""
        this.appendChild(CardElement(this, d))
        d3.select(this).transition().duration(transition_time).attr("transform", `translate(${d.x}, ${d.y})`).style("opacity", 1)
      }

      function cardExit(d) {
        const g = d3.select(this)
        g.transition().duration(transition_time).style("opacity", 0).attr("transform", `translate(${d._x}, ${d._y})`)
          .on("end", () => g.remove())
      }

      function CardElement(el, d) {
        if (store.state.customCard) return store.state.customCard({el, d, store})
        else return CardElementDefault(d)
      }

      function CardElementDefault(d) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", 'g'),
          show_mini_tree = store.state.mini_tree && !isAllRelativeDisplayed(d, tree.data)

        el.innerHTML = Card({
          d,
          card_display: store.state.card_display,
          card_dim: store.state.card_dim,
          show_mini_tree: show_mini_tree,
          show_edit: store.state.edit,
          show_add: store.state.add,
          show_hide_rels: store.state.hide_rels,
          custom_elements: store.state.custom_elements,
          maleIcon: store.state.maleIcon,
          femaleIcon: store.state.femaleIcon,
        }).template

        return el
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
            <clipPath id="card_clip"><path d="${curvedRectPath({w:card_dim.w, h:card_dim.h}, 5)}"></clipPath>
            <clipPath id="card_text_clip"><rect width="${card_dim.w-card_dim.text_x-10}" height="${card_dim.h-10}"></rect></clipPath>
            <clipPath id="card_image_clip"><path d="M0,0 Q 0,0 0,0 H${card_dim.img_w} V${card_dim.img_h} H0 Q 0,${card_dim.img_h} 0,${card_dim.img_h} z"></clipPath>
            <clipPath id="card_image_clip_curved"><path d="${curvedRectPath({w: card_dim.img_w, h:card_dim.img_h}, 5, ['rx', 'ry'])}"></clipPath>
          </defs>
          <rect width="${svg_dim.width}" height="${svg_dim.height}" fill="transparent" />
          <g class="view">
            <g class="links_view"></g>
            <g class="cards_view"></g>
          </g>
          <g style="transform: translate(100%, 100%)">
            <g class="fit_screen_icon cursor-pointer" style="transform: translate(-50px, -50px); display: none">
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
    store.state.cont.innerHTML = ""
    store.state.cont.appendChild(svg)

    return svg
  }

  function setEventListeners() {
    svg.querySelector(".fit_screen_icon").addEventListener("click", () => store.update.tree())
    ViewAddEventListeners(store);
  }

  function curvedRectPath(dim, curve, no_curve_corners) {
    const {w,h} = dim,
      c = curve,
      ncc = no_curve_corners || [],
      ncc_check = (corner) => ncc.includes(corner),
      lx = ncc_check('lx') ? `M0,0` : `M0,${c} Q 0,0 5,0`,
      rx = ncc_check('rx') ? `H${w}` : `H${w-c} Q ${w},0 ${w},5`,
      ry = ncc_check('ry') ? `V${h}` : `V${h-c} Q ${w},${h} ${w-c},${h}`,
      ly = ncc_check('ly') ? `H0` : `H${c} Q 0,${h} 0,${h-c}`

    return (`${lx} ${rx} ${ry} ${ly} z`)
  }
}