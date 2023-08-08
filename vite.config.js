import { defineConfig } from 'vite';
import path from 'path';

let base = '/';
if (process.env.NODE_ENV === 'production') {
  // base = '/baby/';
  base = 'https://cdn.jsdelivr.net/gh/lanyuechen/baby@gh-pages/';
}

export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'babylonjs': process.env.NODE_ENV === 'development' ? 'babylonjs/babylon.max' : 'babylonjs',
    }
  },
  optimizeDeps: {
    exclude: ['@babylonjs/havok'],
  }
})
