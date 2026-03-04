import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      // src/d3.js has a commented-out import that breaks in Node.
      // Alias it directly to the d3 package.
      './d3.js': 'd3',
      '../d3.js': 'd3',
    }
  }
})
