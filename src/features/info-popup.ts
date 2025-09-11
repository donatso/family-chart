import * as d3 from "d3"

export default function(cont: HTMLElement, onClose?: () => void) { return new InfoPopup(cont, onClose) }

export class InfoPopup {
  cont: HTMLElement
  popup_cont: HTMLElement
  active: boolean
  onClose?: () => void

  constructor(cont: HTMLElement, onClose?: () => void) {
    this.cont = cont
    this.active = false
    this.onClose = onClose

    this.popup_cont = d3.select(this.cont).append('div').attr('class', 'f3-popup').node() as HTMLElement
    this.create()
  }

  create() {
    const popup = d3.select(this.popup_cont)
    popup.html(`
      <div class="f3-popup-content">
        <span class="f3-popup-close">&times;</span>
        <div class="f3-popup-content-inner"></div>
      </div>
    `)

    
    popup.select('.f3-popup-close').on('click', () => {
      this.close()
    })

    popup.on('click', (event) => {
      if (event.target == popup.node()) {
        this.close()
      }
    })
  }

  activate(content?: HTMLElement) {
    const popup_content_inner = d3.select(this.popup_cont).select('.f3-popup-content-inner').node() as HTMLElement
    if (content) popup_content_inner.appendChild(content)
    this.open()
  }

  open() {
    this.active = true
  }

  close() {
    this.popup_cont.remove()
    this.active = false
    if (this.onClose) this.onClose()
  }
}
