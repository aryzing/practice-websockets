import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import livereload from "rollup-plugin-livereload"; // Doesn't work with TLS

export default {
  input: "src/ch06/client/client.tsx",
  output: {
    file: "src/ch06/client/build/bundle.js",
    format: "iife",
    sourcemap: "inline",
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
    typescript({ tsconfig: "src/ch06/client/tsconfig.json" }),
    livereload(), // Doesn't work with TLS
  ],
};
