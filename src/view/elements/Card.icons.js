export function userIcon() {
  return (`
    <g>
      ${bgCircle()}
      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
    </g>
  `)
}

export function plusIcon() {
  return (`
    <g>
      ${bgCircle()}
      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
    </g>
  `)
}

export function pencilIcon() {
  return (`
    <g>
      ${bgCircle()}
      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
    </g>
  `)
}

export function pencilOffIcon() {
  return (`
    <g>
      ${bgCircle()}
      <path d="M18.66,2C18.4,2 18.16,2.09 17.97,2.28L16.13,4.13L19.88,7.88L21.72,6.03C22.11,5.64 22.11,5 21.72,4.63L19.38,2.28C19.18,2.09 18.91,2 18.66,2M3.28,4L2,5.28L8.5,11.75L4,16.25V20H7.75L12.25,15.5L18.72,22L20,20.72L13.5,14.25L9.75,10.5L3.28,4M15.06,5.19L11.03,9.22L14.78,12.97L18.81,8.94L15.06,5.19Z" />
    </g>
  `)
}

function trashIcon() {
  return (`
    <g>
      ${bgCircle()}
      <path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z" />
    </g>
  `)
}

export function userSvgIcon() { return svgWrapper(userIcon()) }
export function plusSvgIcon() { return svgWrapper(plusIcon()) }
export function pencilSvgIcon() { return svgWrapper(pencilIcon()) }
export function pencilOffSvgIcon() { return svgWrapper(pencilOffIcon()) }
export function trashSvgIcon() { return svgWrapper(trashIcon()) }

function svgWrapper(icon) {
  return (`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: currentColor">
      ${icon}
    </svg>
  `)
}

function bgCircle() {
  return (`
    <circle r="12" cx="12" cy="12" style="fill: rgba(0,0,0,0)" />
  `)
}