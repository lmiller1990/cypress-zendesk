import { defineConfig } from "cypress";

const legacyConfig = require("./cypress/plugins/index");

export default defineConfig({
  viewportHeight: 900,
  viewportWidth: 1600,
  defaultCommandTimeout: 30000,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  video: false,
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    reporterEnabled: "mochawesome, mocha-junit-reporter",
    mochawesomeReporterOptions: {
      reportDir: "cypress/results/json",
      reportFilename: "[name]-[datetime]-report",
      timestamp: "isoUtcDateTime",
      quiet: true,
      overwrite: false,
      html: true,
      json: true,
    },
    mochaJunitReporterReporterOptions: {
      mochaFile: "cypress/results/junit-[hash].xml",
    },
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return legacyConfig(on, config); // since we still use the old plugin file to override configs
    },
    specPattern: "cypress/tests/**/*.{js,jsx,ts,tsx}",
    baseUrl: "https://playvox5010.zendesk.com",
    experimentalSessionAndOrigin: true,
    env: {
      grepFilterSpecs: true,
    },
  },
  chromeWebSecurity: false,
  experimentalModifyObstructiveThirdPartyCode: true,
  numTestsKeptInMemory: 0,
});
