import {terser} from "rollup-plugin-terser";
import * as meta from "./package.json";

const config = {
  input: "src/index.js",
  external: Object.keys(meta.dependencies || {}),
  output: [
    // UMD build
    {
      file: `dist/${meta.name}.js`,
      name: "f3",
      format: "umd",
      indent: false,
      extend: true,
      banner: `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`,
      globals: Object.assign({}, ...Object.keys(meta.dependencies || {}).map(key => ({[key]: "f3"})))
    },
    // ESM build
    {
      file: `dist/${meta.name}.esm.js`,
      format: 'es',
      indent: false,
      banner: `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`,
      globals: Object.assign({}, ...Object.keys(meta.dependencies || {}).map(key => ({[key]: "f3"})))
    }
  ],
  plugins: []
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output[0], // Use the UMD output config as base
      file: `dist/${meta.name}.min.js`
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output[0].banner
        }
      })
    ]
  }
];
