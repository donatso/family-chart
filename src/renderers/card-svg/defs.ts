import { CardDim } from "./templates"

export default function setupCardSvgDefs(svg: SVGElement, card_dim: CardDim) {
  if (svg.querySelector("defs#f3CardDef")) return
  svg.insertAdjacentHTML('afterbegin', (`
      <defs id="f3CardDef">
        <linearGradient id="fadeGrad">
          <stop offset="0.9" stop-color="white" stop-opacity="0"/>
          <stop offset=".91" stop-color="white" stop-opacity=".5"/>
          <stop offset="1" stop-color="white" stop-opacity="1"/>
        </linearGradient>
        <mask id="fade" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#fadeGrad)"/></mask>
        <clipPath id="card_clip"><path d="${curvedRectPath({w:card_dim.w, h:card_dim.h}, 5)}"></clipPath>
        <clipPath id="card_text_clip"><rect width="${card_dim.w-10}" height="${card_dim.h}"></rect></clipPath>
        <clipPath id="card_image_clip"><path d="M0,0 Q 0,0 0,0 H${card_dim.img_w} V${card_dim.img_h} H0 Q 0,${card_dim.img_h} 0,${card_dim.img_h} z"></clipPath>
        <clipPath id="card_image_clip_curved"><path d="${curvedRectPath({w: card_dim.img_w, h:card_dim.img_h}, 5, ['rx', 'ry'])}"></clipPath>
      </defs>
    `))

  function curvedRectPath(dim: {w: number, h: number}, curve: number, no_curve_corners?: string[]) {
    const {w,h} = dim,
      c = curve,
      ncc = no_curve_corners || [],
      ncc_check = (corner: string) => ncc.includes(corner),
      lx = ncc_check('lx') ? `M0,0` : `M0,${c} Q 0,0 5,0`,
      rx = ncc_check('rx') ? `H${w}` : `H${w-c} Q ${w},0 ${w},5`,
      ry = ncc_check('ry') ? `V${h}` : `V${h-c} Q ${w},${h} ${w-c},${h}`,
      ly = ncc_check('ly') ? `H0` : `H${c} Q 0,${h} 0,${h-c}`

    return (`${lx} ${rx} ${ry} ${ly} z`)
  }
}

export function updateCardSvgDefs(svg: SVGElement, card_dim: CardDim) {
  if (svg.querySelector("defs#f3CardDef")) {
    svg.querySelector("defs#f3CardDef")!.remove()
  }
  setupCardSvgDefs(svg, card_dim)
}