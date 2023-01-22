/// <reference types="cypress" />

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars

const { lighthouse, pa11y, prepareAudit } = require('cypress-audit');

module.exports = (on, config) => {
    on('before:browser:launch', (...args) => {
        prepareAudit(args[1]);
    });

    require('@cypress/grep/src/plugin')(config); // tagging / grep

    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config
    on('task', {
        failed: require('cypress-failed-log/src/failed')(),
        lighthouse: lighthouse(),
        pa11y: pa11y(), // calling the function is important
    });

    return config;
};
