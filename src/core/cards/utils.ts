import { Datum } from "../../types/data"

export function processCardDisplay(card_display: any) {
  const card_display_arr = []
  if (Array.isArray(card_display)) {
    card_display.forEach(d => {
      if (typeof d === 'function') {
        card_display_arr.push(d)
      } else if (typeof d === 'string') {
        card_display_arr.push((d1: Datum) => d1.data[d])
      } else if (Array.isArray(d)) {
        card_display_arr.push((d1: Datum) => d.map(key => d1.data[key]).join(' '))
      }
    })
  } else if (typeof card_display === 'function') {
    card_display_arr.push(card_display)
  } else if (typeof card_display === 'string') {
    card_display_arr.push((d1: Datum) => d1.data[card_display])
  }
  return card_display_arr
}

