export default function Display(cont_selector, store, card_display) {
  const cont = document.querySelector(cont_selector)

  cont.innerHTML = (`   
    <h5>Display</h5>
    <div class="inputs"></div>
  `)

  createInputs()

  function createInputs() {
    const inputs = cont.querySelector(".inputs")
    inputs.innerHTML = ""
    card_display.forEach((d, i) => {
      const cont = document.createElement("div")
      cont.style.position = "relative";
      cont.innerHTML = (`
        <input type="text" placeholder="label" value="${d.create_form}">
      `)

      let timeout = setTimeout(() => {},1)
      cont.querySelector("input").addEventListener("input", function () {
        card_display[i] = labelCreator(this.value)
        clearTimeout(timeout)
        timeout = setTimeout(store.updateTree, 300)
      })

      inputs.appendChild(cont)
    })
  }
}

function labelCreator(create_form) {
  const keys = create_form.match(/[^{\}]+(?=})/g),
    creator = (d) => {
      let label = create_form;
      keys.forEach(k => label = label.replace(`{${k}}`, d.data[k] || ''))
      return label
    }
  creator.create_form = create_form
  creator.toString = () => `d => \`${create_form.replace(/{/g, '${d.data["').replace(/}/g, '"]}')}\``
  return creator
}