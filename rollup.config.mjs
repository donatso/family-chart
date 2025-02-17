import terser from "@rollup/plugin-terser";
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' with { type: 'json' };




const config = {
  input: "./src/index.ts",
  external: Object.keys(pkg.dependencies || {}),
  output: [
    // UMD build
    {
      file: `dist/${pkg.name}.js`,
      name: "f3",
      format: "umd",
      indent: false,
      extend: true,
      banner: `// ${pkg.homepage} v${pkg.version} Copyright ${(new Date).getFullYear()} ${pkg.author.name}`,
      globals: Object.assign({}, ...Object.keys(pkg.dependencies || {}).map(key => ({[key]: "f3"})))
    },
    // ESM build
    {
      file: `dist/${pkg.name}.esm.js`,
      format: 'es',
      indent: false,
      banner: `// ${pkg.homepage} v${pkg.version} Copyright ${(new Date).getFullYear()} ${pkg.author.name}`,
      globals: Object.assign({}, ...Object.keys(pkg.dependencies || {}).map(key => ({[key]: "f3"})))
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
      file: `dist/${pkg.name}.min.js`
    },
    plugins: [
      typescript(),
      ...config.plugins,
      terser({
        output: {
          preamble: config.output[0].banner
        }
      })
    ]
  }
];
