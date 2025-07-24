export function userIcon() {
  return (`
    <g data-icon="user">
      ${bgCircle()}
      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
    </g>
  `)
}

export function userEditIcon() {
  return (`
    <g data-icon="user-edit">
      ${bgCircle()}
      <path d="M21.7,13.35L20.7,14.35L18.65,12.3L19.65,11.3C19.86,11.09 20.21,11.09 20.42,11.3L21.7,12.58C21.91,
      12.79 21.91,13.14 21.7,13.35M12,18.94L18.06,12.88L20.11,14.93L14.06,21H12V18.94M12,14C7.58,14 4,15.79 4,
      18V20H10V18.11L14,14.11C13.34,14.03 12.67,14 12,14M12,4A4,4 0 0,0 8,8A4,4 0 0,0 12,12A4,4 0 0,0 16,8A4,4 0 0,0 12,4Z" />
    </g>
  `)
}

export function userPlusIcon() {
  return (`
    <g data-icon="user-plus">
      ${bgCircle()}
      <path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z" />
    </g>
  `)
}

export function userPlusCloseIcon() {
  return (`
    <g data-icon="user-plus-close">
      ${bgCircle()}
      <path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z" />
      <line x1="3" y1="3" x2="24" y2="24" stroke="currentColor" stroke-width="2" />
    </g>
  `)
}

export function plusIcon() {
  return (`
    <g data-icon="plus">
      ${bgCircle()}
      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
    </g>
  `)
}

export function pencilIcon() {
  return (`
    <g data-icon="pencil">
      ${bgCircle()}
      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
    </g>
  `)
}

export function pencilOffIcon() {
  return (`
    <g data-icon="pencil-off">
      ${bgCircle()}
      <path d="M18.66,2C18.4,2 18.16,2.09 17.97,2.28L16.13,4.13L19.88,7.88L21.72,6.03C22.11,5.64 22.11,5 21.72,4.63L19.38,2.28C19.18,2.09 18.91,2 18.66,2M3.28,4L2,5.28L8.5,11.75L4,16.25V20H7.75L12.25,15.5L18.72,22L20,20.72L13.5,14.25L9.75,10.5L3.28,4M15.06,5.19L11.03,9.22L14.78,12.97L18.81,8.94L15.06,5.19Z" />
    </g>
  `)
}

export function trashIcon() {
  return (`
    <g data-icon="trash">
      ${bgCircle()}
      <path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z" />
    </g>
  `)
}

export function historyBackIcon() {
  return (`
    <g data-icon="history-back">
      ${bgCircle()}
      <path d="M20 13.5C20 17.09 17.09 20 13.5 20H6V18H13.5C16 18 18 16 18 13.5S16 9 13.5 9H7.83L10.91 12.09L9.5 13.5L4 8L9.5 2.5L10.92 3.91L7.83 7H13.5C17.09 7 20 9.91 20 13.5Z" />
    </g>
  `)
}

export function historyForwardIcon() {
  return (`
    <g data-icon="history-forward">
      ${bgCircle()}
      <path d="M10.5 18H18V20H10.5C6.91 20 4 17.09 4 13.5S6.91 7 10.5 7H16.17L13.08 3.91L14.5 2.5L20 8L14.5 13.5L13.09 12.09L16.17 9H10.5C8 9 6 11 6 13.5S8 18 10.5 18Z" />
    </g>
  `)
}

export function personIcon() {
  return (`
    <g data-icon="person">
      <path d="M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 
        64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 
        0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z" />
    </g>
  `)
}

export function miniTreeIcon() {
  return (`
    <g transform="translate(31,25)" data-icon="mini-tree">
      <rect x="-31" y="-25" width="72" height="15" fill="rgba(0,0,0,0)"></rect>
      <g>
        <rect x="-31" y="-25" width="72" height="15" fill="rgba(0,0,0,0)"></rect>
        <line y2="-17.5" stroke="#fff" />
        <line x1="-20" x2="20" y1="-17.5" y2="-17.5" stroke="#fff" />
        <rect x="-31" y="-25" width="25" height="15" rx="5" ry="5" class="card-male" />
        <rect x="6" y="-25" width="25" height="15" rx="5" ry="5" class="card-female" />
      </g>
    </g>
  `)
}

export function toggleIconOn() {
  return (`
    <g data-icon="toggle-on">
      ${bgCircle()}
      <circle class="f3-small-circle" r="4" cx="18" cy="12" />
      <path d="M17,7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7M17,15A3,3 0 0,1 14,12A3,3 0 0,1 17,9A3,3 0 0,1 20,12A3,3 0 0,1 17,15Z" />
    </g>
  `)
}

export function toggleIconOff() {
  return (`
    <g data-icon="toggle-off">
      ${bgCircle()}
      <circle class="f3-small-circle" r="4" cx="6" cy="12" />
      <path d="M17,7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7M7,15A3,3 0 0,1 4,12A3,3 0 0,1 7,9A3,3 0 0,1 10,12A3,3 0 0,1 7,15Z" />
    </g>
  `)
}

export function chevronDownIcon() {
  return (`
    <g data-icon="chevron-down">
      ${bgCircle()}
      <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
    </g>
  `)
}

export function chevronUpIcon() {
  return (`
    <g data-icon="chevron-up">
      ${bgCircle()}
      <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
    </g>
  `)
}

export function linkOffIcon() {
  return (`
    <g data-icon="link-off">
      ${bgCircle()}
      <path d="M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.43 19.12,14.63 17.79,15L19.25,16.44C20.88,15.61 22,13.95 
      22,12A5,5 0 0,0 17,7M16,11H13.81L15.81,13H16V11M2,4.27L5.11,7.38C3.29,8.12 2,9.91 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 
      3.9,13.71 3.9,12C3.9,10.41 5.11,9.1 6.66,8.93L8.73,11H8V13H10.73L13,15.27V17H14.73L18.74,21L20,19.74L3.27,3L2,4.27Z" />
    </g>
  `)
}

export function infoIcon() {
  return (`
    <g data-icon="info">
      ${bgCircle()}
      <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
    </g>
  `)
}

export function userSvgIcon() { return svgWrapper(userIcon()) }
export function userEditSvgIcon() { return svgWrapper(userEditIcon()) }
export function userPlusSvgIcon() { return svgWrapper(userPlusIcon()) }
export function userPlusCloseSvgIcon() { return svgWrapper(userPlusCloseIcon()) }
export function plusSvgIcon() { return svgWrapper(plusIcon()) }
export function pencilSvgIcon() { return svgWrapper(pencilIcon()) }
export function pencilOffSvgIcon() { return svgWrapper(pencilOffIcon()) }
export function trashSvgIcon() { return svgWrapper(trashIcon()) }
export function historyBackSvgIcon() { return svgWrapper(historyBackIcon()) }
export function historyForwardSvgIcon() { return svgWrapper(historyForwardIcon()) }
export function personSvgIcon() { return svgWrapper(personIcon(), '0 0 512 512') }
export function miniTreeSvgIcon() { return svgWrapper(miniTreeIcon(), '0 0 72 25') }
export function toggleSvgIconOn() { return svgWrapper(toggleIconOn()) }
export function toggleSvgIconOff() { return svgWrapper(toggleIconOff()) }
export function chevronDownSvgIcon() { return svgWrapper(chevronDownIcon()) }
export function chevronUpSvgIcon() { return svgWrapper(chevronUpIcon()) }
export function linkOffSvgIcon() { return svgWrapper(linkOffIcon()) }
export function infoSvgIcon() { return svgWrapper(infoIcon()) }

function svgWrapper(icon: string, viewBox='0 0 24 24') {
  const match = icon.match(/data-icon="([^"]+)"/);
  const dataIcon = match ? `data-icon="${match[1]}"` : '';
  
  return (`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" style="fill: currentColor" ${dataIcon}>
      ${icon}
    </svg>
  `)
}

function bgCircle() {
  return (`
    <circle r="12" cx="12" cy="12" style="fill: rgba(0,0,0,0)" />
  `)
}