import d3 from '../d3.js'

export default function(...args) { return new Modal(...args) }

function Modal(cont) {

  this.cont = cont
  this.modal_cont = null
  this.active = false
  this.onClose = null

  this.init()
}

Modal.prototype.init = function() {
  this.modal_cont = d3.select(this.cont).append('div').attr('class', 'f3-modal').node()
  d3.select(this.modal_cont).style('display', 'none')
  this.create()
}

Modal.prototype.create = function() {
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

Modal.prototype.activate = function(content, {boolean, onAccept, onCancel}={}) {
  this.reset()

  if (typeof content === 'string') {
    d3.select(this.modal_cont).select('.f3-modal-content-inner').html(content)
  }
  else {
    d3.select(this.modal_cont).select('.f3-modal-content-inner').node().appendChild(content)
  }

  if (boolean) {
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

Modal.prototype.reset = function() {
  this.onClose = null
  d3.select(this.modal_cont).select('.f3-modal-content-inner').html('')
  d3.select(this.modal_cont).select('.f3-modal-content-bottom').html('')
}

Modal.prototype.open = function() {
  this.modal_cont.style.display = 'block'
  this.active = true
}

Modal.prototype.close = function() {
  this.modal_cont.style.display = 'none'
  this.active = false
  if (this.onClose) this.onClose()
}