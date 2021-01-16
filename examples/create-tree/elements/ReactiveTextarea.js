import f3 from "../../../src/index.js"

export default function ReactiveTextarea(updateData, textarea_selector, update_btn_selector) {
  const textarea = document.querySelector(textarea_selector)

  document.querySelector(update_btn_selector).addEventListener("click",  () => {
    updateData(JSON.parse(textarea.value))
  })

  return {update: updateTextArea}

  function updateTextArea(data) {
    let data_no_to_add = JSON.parse(JSON.stringify(data))
    data_no_to_add.forEach(d => d.to_add ? f3.handlers.removeToAdd(d, data_no_to_add) : d)
    data_no_to_add.forEach(d => delete d.main)
    data_no_to_add.forEach(d => delete d.hide_rels)
    textarea.value = JSON.stringify(data_no_to_add, null, 2)
  }
}