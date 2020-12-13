import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import livereload from "rollup-plugin-livereload";

export default {
  input: "src/ch04/client/client.tsx",
  output: {
    file: "src/ch04/client/build/bundle.js",
    format: "iife",
    sourcemap: "inline",
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
    typescript({ tsconfig: "src/ch04/client/tsconfig.json" }),
    livereload(),
  ],
};
