import { defineConfig } from "cypress";

module.exports = defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    scrollBehavior: 'center',
    injectDocumentDomain: true
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
});
