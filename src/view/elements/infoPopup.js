import d3 from '../../d3.js'

export default function(...args) { return new InfoPopup(...args) }

function InfoPopup(cont, onClose) {
  this.cont = cont
  this.popup_cont = null
  this.active = false
  this.onClose = onClose

  this.init()
}

InfoPopup.prototype.init = function() {
  this.popup_cont = d3.select(this.cont).append('div').attr('class', 'f3-popup').node()
  this.create()
}

InfoPopup.prototype.create = function() {
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

InfoPopup.prototype.activate = function(content) {
  if (content) d3.select(this.popup_cont).select('.f3-popup-content-inner').node().appendChild(content)
  this.open()
}

InfoPopup.prototype.open = function() {
  this.active = true
}

InfoPopup.prototype.close = function() {
  this.popup_cont.remove()
  this.active = false
  if (this.onClose) this.onClose()
}