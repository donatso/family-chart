import d3 from "../../d3.js";

export default function Link({d, entering, exiting}) {
  const path = createPath(d, entering, exiting);

  return {template: (`
    <path d="${path}" fill="none" stroke="#fff" />
  `)}
}

export function createPath(d, is_) {
  const line = d3.line().curve(d3.curveMonotoneY),
    lineCurve = d3.line().curve(d3.curveBasis),
    path_data = is_ ? d._d() : d.d

  if (!d.curve) return line(path_data)
  else if (d.curve === true) return lineCurve(path_data)
}