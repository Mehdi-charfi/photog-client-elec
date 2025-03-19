// import { resolve } from 'path'
// import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
// import react from '@vitejs/plugin-react'


// export default defineConfig({
//   main: {
//     plugins: [externalizeDepsPlugin()]
//   },
//   preload: {
//     plugins: [externalizeDepsPlugin()]
//   },
//   renderer: {
//     resolve: {
//       alias: {
//         '@renderer': resolve('src/renderer/src')
//       }
//     },
//     plugins: [react()]
//   }
// })
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        crypto: 'crypto-browserify', // Polyfill for crypto
        stream: 'stream-browserify', // Polyfill for stream
        util: 'util', // Polyfill for util
      },
    },
    plugins: [react()],
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis', // Polyfill for global
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true, // Polyfill for process
            buffer: true, // Polyfill for buffer
          }),
          NodeModulesPolyfillPlugin(), // Polyfill for Node.js modules
        ],
      },
    },
  },
});