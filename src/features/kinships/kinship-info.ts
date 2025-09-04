import * as d3 from "d3"
import { calculateKinships } from './calculate-kinships'
import { getKinshipsDataStash } from './kinships-data'
import { infoSvgIcon } from '../../renderers/icons'
import createInfoPopup, { InfoPopup } from '../info-popup'
import createChart from '../../core/chart'
import CardHtml from '../../core/cards/card-html'
import { getCurrentZoom, zoomTo } from '../../handlers/view-handlers'
import { KinshipInfoConfig, Kinships } from './calculate-kinships'
import { Datum, Data } from '../../types/data'
import { DatumKinship } from './kinships-data'
import { TreeDatum } from "../../types/treeData"

export function kinshipInfo(kinship_info_config: KinshipInfoConfig, rel_id: Datum['id'], data_stash: Data) {
  const {self_id, getLabel, title} = kinship_info_config
  const relationships = calculateKinships(self_id!, data_stash, kinship_info_config)
  const relationship = relationships[rel_id]
  if (!relationship) return
  let label = relationship
  if (relationship === 'self') label = 'You'
  else label = capitalizeLabel(label)
  const html = (`
    <div class="f3-kinship-info">
      <div class="f3-info-field">
        <span class="f3-info-field-label">${title}</span>
        <span class="f3-info-field-value">
          <span>${label}</span>
          <span class="f3-kinship-info-icon">${infoSvgIcon()}</span>
        </span>
      </div>
    </div>
  `)
  const kinship_info_node = d3.create('div').html(html).select('div').node() as HTMLElement
  let popup: InfoPopup | null = null;
  d3.select(kinship_info_node).select('.f3-kinship-info-icon').on('click', (e) => createPopup(e, kinship_info_node))
  return kinship_info_node

  function createPopup(e: MouseEvent, cont: HTMLElement) {
    const width = 250
    const height = 400
    let left = e.clientX - width - 10
    let top = e.clientY - height - 10
    if (left + width > window.innerWidth) {
      left = window.innerWidth - width - 10
    }
    if (top < 0) {
      top = 10
    }
    if (popup && popup.active) {
      popup.close()
      popup = null
      return
    }
    
    popup = createInfoPopup(cont)
    d3.select(popup.popup_cont)
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .style('left', `${left}px`)
      .style('top', `${top}px`)

    const inner_cont = popup.popup_cont.querySelector('.f3-popup-content-inner') as HTMLElement
 
    popup.activate()
    createSmallTree(self_id!, rel_id, data_stash, relationships, inner_cont, getLabel!)
  }
}

interface TreeDatumKinship extends TreeDatum {
  data: DatumKinship
}

function createSmallTree(
  self_id: Datum['id'],
  rel_id: Datum['id'],
  data_stash: Data, relationships: Kinships, parent_cont: HTMLElement, getLabel: (d: DatumKinship) => string
) {
  if (!d3.select(parent_cont).select('#SmallChart').node()) {
    d3.select(parent_cont).append('div').attr('id', 'SmallChart').attr('class', 'f3')
  }
  const small_chart = d3.select('#SmallChart')
  small_chart.selectAll('*').remove()
  const small_chart_data = getKinshipsDataStash(self_id, rel_id, data_stash, relationships)!

  let kinship_label_toggle = true
  const kinship_label_toggle_cont = small_chart.append('div')

  create(small_chart_data)

  function create(data: DatumKinship[]) {
    const f3Chart = createChart('#SmallChart', data)
      .setTransitionTime(500)
      .setCardXSpacing(170)
      .setCardYSpacing(70)
      .setSingleParentEmptyCard(false)
  
    const f3Card = f3Chart.setCardHtml()
      .setStyle('rect')
      .setCardInnerHtmlCreator((d: TreeDatumKinship) => {
        return getCardInnerRect(d)
      })
      .setOnCardUpdate(function(this: HTMLElement, d: TreeDatumKinship) {
        const card = d3.select(this).select('.card')
        card.classed('card-main', false)
      })

    f3Card.onCardClick = ((e: MouseEvent, d: TreeDatumKinship) => {})
  
    f3Chart.updateTree({initial: true})

    setTimeout(() => setupSameZoom(0.65), 100)

    createKinshipLabelToggle()

    function getCardInnerRect(d: TreeDatumKinship) {
      let label = d.data.kinship === 'self' ? 'You' : d.data.kinship!
      label = capitalizeLabel(label)
      if (!kinship_label_toggle) label = getLabel(d.data)
      
      return (`
        <div class="card-inner card-rect ${getCardClass()}">
          <div class="card-label">${label}</div>
        </div>
      `)

      function getCardClass() {
        if (d.data.kinship === 'self') {
          return 'card-kinship-self' + (kinship_label_toggle ? '' : ' f3-real-label')
        } else if (d.data.id === rel_id) {
          return 'card-kinship-rel'
        } else {
          return 'card-kinship-default'
        }
      }
    }

    function createKinshipLabelToggle() {
      kinship_label_toggle_cont
        .classed('f3-kinship-labels-toggle', true)

      kinship_label_toggle_cont.append('label')
        .text('Kinship labels')
        .append('input')
          .attr('type', 'checkbox')
          .attr('checked', true)
          .on('change', (e) => {
            kinship_label_toggle = !kinship_label_toggle
            f3Chart.updateTree({initial: false, tree_position: 'inherit'})
          })
    }

    function setupSameZoom(zoom_level: number) {
      const svg = f3Chart.cont.querySelector('svg.main_svg') as SVGElement
      const current_zoom = getCurrentZoom(svg)
      if (current_zoom.k > zoom_level) {
        zoomTo(svg, zoom_level)
      }
    }
  }
}

function capitalizeLabel(label: string) {
  label = label[0].toUpperCase() + label.slice(1)
  if (label.includes('great-')) label = label.replace('great-', 'Great-')
  return label
}