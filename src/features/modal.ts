import * as d3 from "d3"

export default function(cont: HTMLElement) { return new Modal(cont) }

export class Modal {

  cont: HTMLElement
  modal_cont: HTMLElement
  active: boolean
  onClose: (() => void) | null

  constructor(cont: HTMLElement) {
    this.cont = cont
    this.active = false
    this.onClose = null

    this.modal_cont = d3.select(this.cont).append('div').attr('class', 'f3-modal').node()!
    d3.select(this.modal_cont).style('display', 'none')
    this.create()
  }

  create() {
    const modal = d3.select(this.modal_cont)
    modal.html(`
      <div class="f3-modal-content">
        <span class="f3-modal-close">&times;</span>
        <div class="f3-modal-content-inner"></div>
        <div class="f3-modal-content-bottom"></div>
      </div>
    `)
  
    
    modal.select('.f3-modal-close').on('click', () => {
      this.close()
    })
  
    modal.on('click', (event) => {
      if (event.target == modal.node()) {
        this.close()
      }
    })
  }
  
  activate(content: string | HTMLElement, {boolean, onAccept, onCancel}: {boolean?: boolean, onAccept?: () => void, onCancel?: () => void}={}) {
    this.reset()
  
    const modal_content_inner = d3.select(this.modal_cont).select('.f3-modal-content-inner').node()! as HTMLElement
    if (typeof content === 'string') {
      modal_content_inner.innerHTML = content
    }
    else {
      modal_content_inner.appendChild(content)
    }
  
    if (boolean) {
      if (!onAccept) throw new Error('onAccept is required')
      if (!onCancel) throw new Error('onCancel is required')
      d3.select(this.modal_cont).select('.f3-modal-content-bottom').html(`
        <button class="f3-modal-accept f3-btn">Accept</button>
        <button class="f3-modal-cancel f3-btn">Cancel</button>
      `)
      d3.select(this.modal_cont).select('.f3-modal-accept').on('click', () => {onAccept(); this.reset(); this.close()})
      d3.select(this.modal_cont).select('.f3-modal-cancel').on('click', () => {this.close()})
      this.onClose = onCancel
    }
  
    this.open()
  }
  
  reset() {
    this.onClose = null
    d3.select(this.modal_cont).select('.f3-modal-content-inner').html('')
    d3.select(this.modal_cont).select('.f3-modal-content-bottom').html('')
  }
  
  open() {
    this.modal_cont.style.display = 'block'
    this.active = true
  }
  
  close() {
    this.modal_cont.style.display = 'none'
    this.active = false
    if (this.onClose) this.onClose()
  }
}