import * as d3 from 'd3';

export default function Link<Datum>({d, entering, exiting}: {d: {_d: () => Datum[],d:Datum[],curve: unknown}, entering: unknown,exiting: unknown}) {
  const path = createPath(d, entering);

  return {template: (`
    <path d="${path}" fill="none" stroke="#fff" />
  `)}
}

export function createPath<Datum>(d: {_d: () => Datum[],d:Datum[],curve: unknown}, is_?: unknown) {
  const line = d3.line<Datum>().curve(d3.curveMonotoneY),
    lineCurve = d3.line<Datum>().curve(d3.curveBasis),
    path_data = is_ ? d._d() : d.d

  if (!d.curve) return line(path_data)
  else if (d.curve === true) return lineCurve(path_data)
}