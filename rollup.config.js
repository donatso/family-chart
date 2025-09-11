import fs from 'fs';
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const meta = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const globals = {
  "d3": "d3"
}
const banner = `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`
const input = "src/index.ts"
const external = ["d3"]
const plugins = [
  typescript({
    tsconfig: "./tsconfig.json",
    declaration: true,
    declarationDir: "./dist/types",
    exclude: ["tests/**/*", "examples/**/*"]
  })
]

export default [
  // UMD build
  {
    input: input,
    external: external,
    output: {
      file: `dist/${meta.name}.js`,
      name: "f3",
      format: "umd",
      banner: banner,
      globals: globals
    },
    plugins: plugins
  },
  // ESM build
  {
    input: input,
    external: external,
    output:     {
      file: `dist/${meta.name}.esm.js`,
      format: 'es',
      banner: banner,
      globals: globals
    },
    plugins: plugins
  },
  // minified UMD build
  {
    input: input,
    external: external,
    output: {
      file: `dist/${meta.name}.min.js`,
      name: "f3",
      format: "umd",
      banner: banner,
      globals: globals
    },
    plugins: [
      ...plugins,
      terser({
        output: {
          preamble: banner
        }
      })
    ]
  }
]