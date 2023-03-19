import { ZendeskChat } from "../pages/zendeskChat";

describe("chat", () => {
  const baseUrl = Cypress.env("BASE_URL");
  const email = Cypress.env("EMAIL");
  const password = Cypress.env("PASSWORD");

  let zendesk: ZendeskChat;

  before("Setup services", () => {
    cy.login(email, password).visit(`${baseUrl}/agent/dashboard`);
    zendesk = new ZendeskChat();
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
