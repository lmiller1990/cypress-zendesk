import { Zendesk } from "../pages/zendesk";

describe("chat", () => {
  const baseUrl = Cypress.env("BASE_URL");
  const email = Cypress.env("EMAIL");
  const password = Cypress.env("PASSWORD");

  let zendesk: Zendesk;

  before("Setup services", () => {
    cy.login(email, password).visit(`${baseUrl}/agent/dashboard`);
    zendesk = new Zendesk();
  });

  it("test chat", () => {
    zendesk
      .updateChatStatus("Online")
      .createChatAsVisitor("Test chat from visitor", false);
    cy.login(email, password).visit(`${baseUrl}/agent/dashboard`);
    zendesk
      .answerChatFromVisitor()
      .replyChatAsAgent("Hello visitor")
      .endChatAsVisitor({ rateChat: false }, "Bye", false);
  });
});
