import { ZendeskTicket } from "../pages/zendeskTicket";

describe("ticket", () => {
  const baseUrl = Cypress.env("BASE_URL");
  const email = Cypress.env("EMAIL");
  const password = Cypress.env("PASSWORD");

  let zendesk: ZendeskTicket;

  before("Setup services", () => {
    cy.login(email, password).visit(`${baseUrl}/agent/dashboard`);
    zendesk = new ZendeskTicket();
  });

  it("test ticket", () => {
    cy.log("Creating new ticket with public reply").then(() => {
      zendesk.createTicket();
    });
  });
});
