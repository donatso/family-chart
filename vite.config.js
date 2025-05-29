import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 8080
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@examples': resolve(__dirname, 'examples')
    }
  }
})