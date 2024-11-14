const d3 = (typeof window === "object" && window.d3) ? window.d3 : await import('d3').then(module => module.default || module)
export default d3;