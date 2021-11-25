import f3 from "../../../src/index.js"

export default function Edit(cont_selector, card_edit) {
  const cont = document.querySelector(cont_selector)

  cont.innerHTML = (`   
    <h5>Edit</h5>
    <div class="inputs"></div>
    <button class="btn">add new</button>
  `)

  cont.querySelector(".btn").addEventListener('click', function () {
    card_edit.push({type: 'text', placeholder: '', key: ''})
    createInputs()
  })

  createInputs()

  function createInputs() {
    const inputs = cont.querySelector(".inputs")
    inputs.innerHTML = ""
    card_edit.forEach(d => {
      if (d.key === 'avatar') return
      const cont = document.createElement("div")
      cont.style.position = "relative";
      cont.innerHTML = (`
        <input type="text" placeholder="field name" value="${d.key}">
        <span style="position: absolute; font-size: 20px; right: 5px;top:10px;cursor: pointer">×</span>
      `)

      cont.querySelector("input").addEventListener("input",  function (){
        d.key = this.value
        d.placeholder = this.value
      })

      cont.querySelector("span").addEventListener("click",  function (){
        card_edit.splice(card_edit.findIndex(d0 => d0 === d), 1);
        createInputs()
      })

      inputs.appendChild(cont)
    })
  }
}