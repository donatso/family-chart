import f3 from "../../../src/index.js"

export default function Display(cont_selector, store) {
  const cont = document.querySelector(cont_selector),
    card_display = store.state.card_display;

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
        timeout = setTimeout(store.update.tree, 300)
      })

      inputs.appendChild(cont)
    })
  }
}

function labelCreator(create_form) {
  const keys = create_form.match(/[^{\}]+(?=})/g),
    creator = (d) => {
      let label = create_form;
      keys.forEach(k => label = label.replace(`{${k}}`, d.data[k]))
      return label
    }

  creator.create_form = create_form
  return creator
}