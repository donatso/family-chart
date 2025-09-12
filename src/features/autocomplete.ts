import * as d3 from "d3"
import {personSvgIcon, chevronDownSvgIcon, linkOffSvgIcon} from "../renderers/icons"
import { checkIfConnectedToFirstPerson } from "../handlers/check-person-connection"
import { Datum } from "../types/data"

export default function(cont: Autocomplete['cont'], onSelect: Autocomplete['onSelect'], config: Autocomplete['config'] = {}) { return new Autocomplete(cont, onSelect, config) }

interface AutocompleteOption {
  label: string
  value: string
  optionHtml: (d: AutocompleteOption) => string
  label_html?: string
  class?: string
}

class Autocomplete {
  cont: HTMLElement
  autocomplete_cont: HTMLElement
  options: AutocompleteOption[]
  onSelect: (value: string) => void
  config?: {
    placeholder?: string
  }
  getOptions?: () => Autocomplete['options']

  constructor(cont: HTMLElement, onSelect: (value: string) => void, config: {
    placeholder?: string
  } = {}) {
    this.cont = cont
    this.options = []
    this.onSelect = onSelect
    this.config = config
    this.autocomplete_cont = d3.select(this.cont).append('div').attr('class', 'f3-autocomplete-cont').node() as HTMLElement
    this.create()
  }

  create() {
    const self = this
    d3.select(this.autocomplete_cont).html(`
      <div class="f3-autocomplete">
        <div class="f3-autocomplete-input-cont">
          <input type="text" placeholder="${this.config?.placeholder || 'Search'}">
          <span class="f3-autocomplete-toggle">${chevronDownSvgIcon()}</span>
        </div>
        <div class="f3-autocomplete-items" tabindex="0"></div>
      </div>
    `)
  
    const search_cont = d3.select(this.autocomplete_cont).select(".f3-autocomplete")
    const search_input = search_cont.select("input")
    const dropdown = search_cont.select(".f3-autocomplete-items")
  
    search_cont.on("focusout", () => {
        setTimeout(() => {
          const search_cont_node = search_cont.node() as HTMLElement
          if (!search_cont_node.contains(document.activeElement)) {
            closeDropdown()
          }
        }, 200);
      })
  
    search_input
      .on("focus", () => {
        updateOptions()
        activateDropdown()
      })
      .on("input", activateDropdown)
      .on("keydown", handleArrowKeys)
  
    dropdown.on("wheel", e => e.stopPropagation())
  
    search_cont.select(".f3-autocomplete-toggle")
      .on("click", (e) => {
        e.stopPropagation()
        const is_active = search_cont.classed("active")
        search_cont.classed("active", !is_active)
        if (is_active) {
          closeDropdown()
        } else {
          const search_input_node = search_input.node() as HTMLElement
          search_input_node.focus()
          activateDropdown()
        }
      })
  
    function activateDropdown() {
      search_cont.classed("active", true)
      const search_input_value = search_input.property("value")
      const filtered_options = self.options.filter(d => d.label.toLowerCase().includes(search_input_value.toLowerCase()))
      filtered_options.forEach(setHtmlLabel)
      filtered_options.sort(sortByLabel)
      updateDropdown(filtered_options)
  
      function setHtmlLabel(d: AutocompleteOption) {
        const index = d.label.toLowerCase().indexOf(search_input_value.toLowerCase())
        if (index !== -1) d.label_html = itemLabel()
        else d.label_html = d.label
  
        function itemLabel() {
          return d.label.substring(0, index) 
            + '<strong>' + d.label.substring(index, index + search_input_value.length) 
            + '</strong>' + d.label.substring(index + search_input_value.length)
        }
      }
  
      function sortByLabel(a: AutocompleteOption, b: AutocompleteOption) {
        if (a.label < b.label) return -1
        else if (a.label > b.label) return 1
        else return 0
      }
    }
  
    function closeDropdown() {
      search_cont.classed("active", false)
      updateDropdown([])
    }
  
    function updateDropdown(filtered_options: Autocomplete['options']) {
      dropdown.selectAll("div.f3-autocomplete-item")
        .data(filtered_options, d => (d as AutocompleteOption)?.value).join("div")
        .attr("class", "f3-autocomplete-item")
        .on("click", (e, d) => {
          self.onSelect(d.value)
        })
        .html(d => d.optionHtml ? d.optionHtml(d) : itemHtml(d))
  
  
      function itemHtml(d: AutocompleteOption) {
        return `<div class="${d.class ? d.class : ''}">${d.label_html}</div>`
      }
    }
  
    function updateOptions() {
      self.options = self.getOptions!()
    }
  
    function handleArrowKeys(e: KeyboardEvent) {
      const items = dropdown.selectAll("div.f3-autocomplete-item").nodes() as HTMLElement[]
      const currentIndex = items.findIndex(item => d3.select(item).classed("f3-selected"))
      
      if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        selectItem(items, nextIndex)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        selectItem(items, prevIndex)
      } else if (e.key === "Enter" && currentIndex !== -1) {
        e.preventDefault()
        const d = d3.select(items[currentIndex]).datum() as AutocompleteOption
        if (d) {
          self.onSelect(d.value)
        }
      }
  
      function selectItem(items: HTMLElement[], index: number) {
        items.forEach(item => d3.select(item).classed("f3-selected", false))
        if (items[index]) {
          d3.select(items[index]).classed("f3-selected", true)
          items[index].scrollIntoView({ block: "nearest" })
        }
      }
    }
  }
  
  setOptionsGetter(getOptions: () => Autocomplete['options']) {
    this.getOptions = getOptions
    return this
  }
  
  setOptionsGetterPerson(getData: () => Datum[], getLabel: (d: Datum) => string) {
    this.getOptions = () => {
      const options: Autocomplete['options'] = []
      const data = getData()
      data.forEach(d => {
        if (d.to_add || d.unknown || d._new_rel_data) return
        if (options.find(d0 => d0.value === d.id)) return
        options.push({
          label: getLabel(d),
          value: d.id,
          optionHtml: optionHtml(d)
        })
      })
      return options
    }
    return this
  
    function optionHtml(d: Datum) {
      const link_off = !checkIfConnectedToFirstPerson(d, getData())
      return (option: AutocompleteOption) => (`
        <div>
          <span style="float: left; width: 10px; height: 10px; margin-right: 10px;" class="f3-${getPersonGender(d)}-color">${personSvgIcon()}</span>
          <span>${option.label_html}</span>
          ${link_off ? `<span style="float: right; width: 10px; height: 10px; margin-left: 5px;" title="This profile is not connected to the main profile">${linkOffSvgIcon()}</span>` : ''}
        </div>
      `)
    }
  
    function getPersonGender(d: Datum) {
      if (d.data.gender === "M") return "male"
      else if (d.data.gender === "F") return "female"
      else return "genderless"
    }
  }
  
  destroy() {
    this.autocomplete_cont.remove()
  }

}