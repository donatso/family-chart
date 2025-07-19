import fs from 'fs';
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const meta = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const globals = {
  "d3": "d3",
  "d3-array": "d3",
  "d3-hierarchy": "d3"
}
const banner = `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`

export default {
  input: "src/index.js",
  external: ["d3", "d3-array", "d3-hierarchy"],
  output: [
    // UMD build
    {
      file: `dist/${meta.name}.js`,
      name: "f3",
      format: "umd",
      indent: false,
      extend: true,
      banner: banner,
      globals: globals
    },
    // minified UMD build
    {
      file: `dist/${meta.name}.min.js`,
      name: "f3",
      format: "umd",
      indent: false,
      extend: true,
      banner: banner,
      globals: globals
    },
    // ESM build
    {
      file: `dist/${meta.name}.esm.js`,
      format: 'es',
      indent: false,
      banner: banner,
      globals: globals
    }
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "./dist/types",
      exclude: ["tests/**/*", "examples/**/*"]
    }),
    terser({
      output: {
        preamble: banner
      }
    })
  ]
};