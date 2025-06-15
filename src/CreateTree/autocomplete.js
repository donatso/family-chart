import d3 from '../d3.js'
import {personSvgIcon, chevronDownSvgIcon, linkOffSvgIcon} from '../view/elements/Card.icons.js'
import { checkIfConnectedToFirstPerson } from './checkPersonConnection.js'

export default function(...args) { return new Autocomplete(...args) }

function Autocomplete(cont, onSelect) {
  this.cont = cont
  this.autocomplete_cont = null
  this.options = []
  this.onSelect = onSelect

  this.init()
}

Autocomplete.prototype.init = function() {
  this.autocomplete_cont = d3.select(this.cont).append('div').attr('class', 'f3-autocomplete-cont').node()
  d3.select(this.autocomplete_cont)
  this.create()
}

Autocomplete.prototype.create = function() {
  const self = this
  d3.select(this.autocomplete_cont).html(`
    <div class="f3-autocomplete">
      <div class="f3-autocomplete-input-cont">
        <input type="text" placeholder="Search">
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
        if (!search_cont.node().contains(document.activeElement)) {
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
        search_input.node().focus()
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

    function setHtmlLabel(d) {
      const index = d.label.toLowerCase().indexOf(search_input_value.toLowerCase())
      if (index !== -1) d.label_html = itemLabel()
      else d.label_html = d.label

      function itemLabel() {
        return d.label.substring(0, index) 
          + '<strong>' + d.label.substring(index, index + search_input_value.length) 
          + '</strong>' + d.label.substring(index + search_input_value.length)
      }
    }

    function sortByLabel(a, b) {
      if (a.label < b.label) return -1
      else if (a.label > b.label) return 1
      else return 0
    }
  }

  function closeDropdown() {
    search_cont.classed("active", false)
    updateDropdown([])
  }

  function updateDropdown(filtered_options) {
    dropdown.selectAll("div.f3-autocomplete-item")
      .data(filtered_options, d => d?.value).join("div")
      .attr("class", "f3-autocomplete-item")
      .on("click", (e, d) => {
        self.onSelect(d.value)
      })
      .html(d => d.optionHtml ? d.optionHtml(d) : itemHtml(d))


    function itemHtml(d) {
      return `<div class="${d.class ? d.class : ''}">${d.label_html}</div>`
    }
  }

  function updateOptions() {
    self.options = self.getOptions()
  }

  function handleArrowKeys(e) {
    const items = dropdown.selectAll("div.f3-autocomplete-item").nodes()
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
      const d = d3.select(items[currentIndex]).datum()
      if (d) {
        self.onSelect(d.value)
      }
    }

    function selectItem(items, index) {
      items.forEach(item => d3.select(item).classed("f3-selected", false))
      if (items[index]) {
        d3.select(items[index]).classed("f3-selected", true)
        items[index].scrollIntoView({ block: "nearest" })
      }
    }
  }
}

Autocomplete.prototype.setOptionsGetter = function(getOptions) {
  this.getOptions = getOptions
  return this
}

Autocomplete.prototype.setOptionsGetterPerson = function(getData, getLabel) {
  this.getOptions = () => {
    const options = []
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

  function optionHtml(d) {
    const link_off = !checkIfConnectedToFirstPerson(d, getData())
    return option => (`
      <div>
        <span style="float: left; width: 10px; height: 10px; margin-right: 10px;" class="f3-${getPersonGender(d)}-color">${personSvgIcon()}</span>
        <span>${option.label_html}</span>
        ${link_off ? `<span style="float: right; width: 10px; height: 10px; margin-left: 5px;" title="This profile is not connected to the main profile">${linkOffSvgIcon()}</span>` : ''}
      </div>
    `)
  }

  function getPersonGender(d) {
    if (d.data.gender === "M") return "male"
    else if (d.data.gender === "F") return "female"
    else return "genderless"
  }
}

Autocomplete.prototype.destroy = function() {
  this.autocomplete_cont.remove()
}