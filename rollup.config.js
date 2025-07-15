import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
// import commonjs from '@rollup/plugin-commonjs'; 
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'index.js',
    output: [
      {
        file: 'dist/aes-bridge.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/aes-bridge.umd.js',
        format: 'umd',
        name: 'aes_bridge',
        sourcemap: true
      },
      {
        file: 'dist/aes-bridge.cjs.js',
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      // commonjs(),
      nodeResolve(),
      json(), 
      terser({
        format: {
          comments: false
        }
      })
    ]
  }
];
