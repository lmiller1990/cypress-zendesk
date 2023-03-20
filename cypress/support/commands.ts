import "cypress-audit/commands";
import "cypress-wait-until";

// Must be declared global to be detected by typescript (allows import/export)
declare global {
  namespace Cypress {
    interface Chainable {
      login(
        email?: string,
        password?: string,
        loginKey?: string
      ): Chainable<any>;

      loginWithForm(email: string, password: string): void;

      getIframe(iframe: string): Chainable<any>;
    }
  }
}

Cypress.Commands.add(
  "login",
  (
    email = Cypress.env("EMAIL"),
    password = Cypress.env("PASSWORD"),
    loginKey = ""
  ) => {
    let baseUrl = Cypress.env("BASE_URL");
    cy.session([email, loginKey], () => {
      cy.visit(`${baseUrl}/auth/v2/login`);
      cy.loginWithForm(email, password);
      cy.visit(`${baseUrl}/agent/dashboard`);
    });
  }
);

Cypress.Commands.add("loginWithForm", (email, password) => {
  cy.get("[type=email]").type(email, { log: false });
  cy.get("[type=password]").type(`${password}{enter}`, { log: false });
});


import "cypress-real-events";
