export function CardBody({d,card_dim,card_display}) {
  return {template: (`
    <g class="card-body">
      <rect width="${card_dim.w}" height="${card_dim.h}" class="card-body-rect" />
      ${CardText({d,card_dim,card_display}).template}
    </g>
  `)
  }
}

export function CardText({d,card_dim,card_display}) {
  return {template: (`
    <g>
      <g class="card-text" clip-path="url(#card_text_clip)">
        <g transform="translate(${card_dim.text_x}, ${card_dim.text_y})">
          <text>
            ${Array.isArray(card_display) ? card_display.map(cd => `<tspan x="${0}" dy="${14}">${cd(d.data)}</tspan>`).join('\n') : card_display(d.data)}
          </text>
        </g>
      </g>
      <rect width="${card_dim.w-10}" height="${card_dim.h}" style="mask: url(#fade)" class="text-overflow-mask" /> 
    </g>
  `)
  }
}

export function CardBodyAddNew({d,card_dim,card_add,label}) {
  return {template: (`
    <g class="card-body ${card_add ? 'card_add' : 'card-unknown'}">
      <rect class="card-body-rect" width="${card_dim.w}" height="${card_dim.h}" fill="rgb(59, 85, 96)" />
      <text transform="translate(${card_dim.w/2}, ${card_dim.h/2})" text-anchor="middle" fill="#fff">
        <tspan font-size="18" dy="${8}">${label}</tspan>
      </text>
    </g>
  `)
  }
}

export function CardBodyOutline({d,card_dim, is_new}) {
  return {template: (`
    <rect width="${card_dim.w}" height="${card_dim.h}" rx="4" ry="4" class="card-outline ${(d.data.main && !is_new) ? 'card-main-outline' : ''} ${is_new ? 'card-new-outline' : ''}" />
  `)
  }
}

export function PencilIcon({d,card_dim,x,y}) {
  return ({template: (`
    <g transform="translate(${x || card_dim.w-20},${y || card_dim.h-20})scale(.6)" style="cursor: pointer" class="card_edit pencil_icon">
      <circle fill="rgba(0,0,0,0)" r="17" cx="8.5" cy="8.5" />
      <path fill="currentColor" transform="translate(-1.5, -1.5)"
         d="M19.082,2.123L17.749,0.79c-1.052-1.052-2.766-1.054-3.819,0L1.925,12.794c-0.06,0.06-0.104,0.135-0.127,0.216
          l-1.778,6.224c-0.05,0.175-0.001,0.363,0.127,0.491c0.095,0.095,0.223,0.146,0.354,0.146c0.046,0,0.092-0.006,0.137-0.02
          l6.224-1.778c0.082-0.023,0.156-0.066,0.216-0.127L19.082,5.942C20.134,4.89,20.134,3.176,19.082,2.123z M3.076,13.057l9.428-9.428
          l3.738,3.739l-9.428,9.428L3.076,13.057z M2.566,13.961l3.345,3.344l-4.683,1.339L2.566,13.961z M18.375,5.235L16.95,6.66
          l-3.738-3.739l1.425-1.425c0.664-0.663,1.741-0.664,2.405,0l1.333,1.333C19.038,3.493,19.038,4.572,18.375,5.235z"/>
    </g>
  `)})
}

export function HideIcon({d,card_dim}) {
  return ({template: (`
    <g transform="translate(${card_dim.w-50},${card_dim.h-20})scale(.035)" style="cursor: pointer" class="card_hide_rels hide_rels_icon">
      <circle fill="rgba(0,0,0,0)" r="256" cx="256" cy="256" />
      <g fill="currentColor">
        <path d="m34,256l26.2,26.2c108,108 283.7,108 391.7,0l26.1-26.2-26.2-26.2c-108-108-283.7-108-391.7,0l-26.1,
          26.2zm222,126.2c-75.8,0-151.6-28.9-209.3-86.6l-32.9-32.9c-3.7-3.7-3.7-9.7 0-13.5l32.9-32.9c115.4-115.4 303.2-115.4 418.6,
          0l32.9,32.9c3.7,3.7 3.7,9.7 0,13.5l-32.9,32.9c-57.7,57.7-133.5,86.6-209.3,86.6z"/>
        <path d="m256,183.5c-40,0-72.5,32.5-72.5,72.5s32.5,72.5 72.5,72.5c40,0 72.5-32.5 72.5-72.5s-32.5-72.5-72.5-72.5zm0,
          164c-50.5,0-91.5-41.1-91.5-91.5 0-50.5 41.1-91.5 91.5-91.5s91.5,41.1 91.5,91.5c0,50.5-41,91.5-91.5,91.5z"/>
      </g>
    </g>
  `)})
}

export function MiniTree({d,card_dim}) {
  return ({template: (`
    <g class="card_family_tree" style="cursor: pointer">
      <rect x="-31" y="-25" width="72" height="15" fill="rgba(0,0,0,0)"></rect>
      <g transform="translate(${card_dim.w*.8},6)scale(.9)">
        <rect x="-31" y="-25" width="72" height="15" fill="rgba(0,0,0,0)"></rect>
        <line y2="-17.5" stroke="#fff" />
        <line x1="-20" x2="20" y1="-17.5" y2="-17.5" stroke="#fff" />
        <rect x="-31" y="-25" width="25" height="15" rx="5" ry="5" class="card-male" />
        <rect x="6" y="-25" width="25" height="15" rx="5" ry="5" class="card-female" />
      </g>
    </g>
  `)})
}

export function PlusIcon({d,card_dim,x,y}) {
  return ({template: (`
    <g class="card_add_relative">
      <g transform="translate(${x || card_dim.w/2},${y || card_dim.h})scale(.13)">
        <circle r="80" cx="40" cy="40" fill="rgba(0,0,0,0)" />
        <g transform="translate(-10, -8)">
          <line
            x1="10" x2="90" y1="50" y2="50"
            stroke="currentColor" stroke-width="15" stroke-linecap="round"
          />
          <line
            x1="50" x2="50" y1="10" y2="90"
            stroke="currentColor" stroke-width="15" stroke-linecap="round"
          />
        </g>
      </g>
    </g>
  `)})
}

export function LinkBreakIcon({x,y,rt,closed}) {
  return ({template: (`
    <g style="
          transform: translate(-12.2px, -.5px);
          cursor: pointer;
        " 
        fill="currentColor" class="card_break_link${closed ? ' closed' : ''}"
      >
      <g style="transform: translate(${x}px,${y}px)scale(.02)rotate(${rt+'deg'})">
        <rect width="1000" height="700" y="150" style="opacity: 0" />
        <g class="link_upper">
          <g>
            <path d="M616.3,426.4c19,4.5,38.1-7.4,42.6-26.4c4.4-19-7.4-38-26.5-42.5L522.5,332c-18,11.1-53.9,33.4-53.9,33.4l80.4,18.6c-7.8,4.9-19.5,12.1-31.3,19.4L616.3,426.4L616.3,426.4z"/>
            <path d="M727.4,244.2c-50.2-11.6-100.3,3.3-135.7,35.4c28.6,22.6,64.5,30.2,116.4,51.3l141,32.6c23.9,5.6,56.6,47.2,51.1,71l-4.1,17c-5.6,23.7-47.3,56.4-71.2,51l-143.4-33.2c-66.8-8.6-104.1-16.6-132.9-7.5c17.4,44.9,55.9,80.8,106.5,92.4L800.9,588c81.3,18.8,162.3-31.5,181.2-112.4l4-17c18.8-81.1-31.7-161.8-112.9-180.6L727.4,244.2z"/>
          </g>
        </g>
        <g class="link_lower">
          <path d="M421.2,384.9l-128,127.6c-13.9,13.8-13.9,36.2,0,50s36.3,13.8,50.2,0.1l136.2-135.8v-36.7l-58.4,58.1V384.9L421.2,384.9z"/>
          <path d="M204.6,742.8c-17.4,17.3-63.3,17.2-80.6,0.1l-12.3-12.3c-17.3-17.3,0.6-81.2,17.9-98.5l100.2-99.9c12.5-14.9,45.8-40.8,66.1-103.7c-47.7-9.4-98.9,4.2-135.8,40.9L54.2,575c-58.9,58.8-58.9,154,0,212.8L66.6,800c58.9,58.8,154.5,58.8,213.4,0l105.8-105.6c38.4-38.3,51.3-91.9,39.7-141c-44,22.7-89,62.3-116,84.8L204.6,742.8z"/>
        </g>
        <g class="link_particles">
          <path d="M351.9,248.4l-26.5,63.4l80.6,30.1L351.9,248.4z"/>
          <path d="M529.3,208l-43,26.6l35.4,52.3L529.3,208z"/>
          <path d="M426.6,158.8l-44-2.9l61.7,134.6L426.6,158.8z"/>
        </g>
      </g>
    </g>
  `)})
}

export function LinkBreakIconWrapper({d,card_dim}) {
  let g = "",
    r = d.data.rels, _r = d.data._rels || {},
    closed = d.data.hide_rels,
    areParents = r => r.father || r.mother,
    areChildren = r => r.children && r.children.length > 0
  if ((d.is_ancestry || d.data.main) && (areParents(r) || areParents(_r))) {g+=LinkBreakIcon({x:card_dim.w/2,y:0, rt: -45, closed}).template}
  if (!d.is_ancestry && d.added) {
    const sp = d.spouse, sp_r = sp.data.rels, _sp_r = sp.data._rels || {};
    if ((areChildren(r) || areChildren(_r)) && (areChildren(sp_r) || areChildren(_sp_r))) {
      g+=LinkBreakIcon({x:d.sx - d.x + card_dim.w/2 +24.4,y: (d.x !== d.sx ? card_dim.h/2 : card_dim.h)+1, rt: 135, closed}).template
    }
  }
  return {template: g}
}

export function CardImage({d, image, card_dim, maleIcon, femaleIcon}) {
  return ({template: (`
    <g style="transform: translate(${card_dim.img_x}px,${card_dim.img_y}px);" class="card_image" clip-path="url(#card_image_clip)">
      ${image 
        ? `<image href="${image}" height="${card_dim.img_h}" width="${card_dim.img_w}" preserveAspectRatio="xMidYMin slice" />`
        : (d.data.data.gender === "F" && !!femaleIcon) ? femaleIcon({card_dim}) 
        : (d.data.data.gender === "M" && !!maleIcon) ? maleIcon({card_dim}) 
        : GenderlessIcon()
      }      
    </g>
  `)})

  function GenderlessIcon() {
    return (`
      <g class="genderless-icon">
        <rect height="${card_dim.img_h}" width="${card_dim.img_w}" fill="rgb(59, 85, 96)" />
        <g transform="scale(${card_dim.img_w*0.001616})">
         <path transform="translate(50,40)" fill="lightgrey" d="M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 
            64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 
            0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z" />
        </g>
      </g>
    `)
  }
}

export function appendTemplate(template, parent, is_first) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", 'g')
  g.innerHTML = template

  if (is_first) parent.insertBefore(g, parent.firstChild)
  else parent.appendChild(g)
}
