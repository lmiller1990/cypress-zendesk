export class Zendesk {
  private chatUrl: string;

  constructor() {
    this.chatUrl = "https://www.zopim.com";
  }

  /**
   * Update agent chat status
   * @param status the chat status
   * @returns ZendeskDashboardPage
   */
  updateChatStatus(status: string) {
    cy.waitUntil(() => {
      return cy
        .get('[data-test-id="omnichannel-agent-status-menu-button"]')
        .should("be.visible")
        .click()
        .get('[data-test-id="omnichannel-agent-status-menu"]')
        .should("be.visible")
        .contains('[data-garden-id="dropdowns.item"]', status)
        .click()
        .get('[data-test-id="omnichannel-agent-status-menu-button"]')
        .then(($status) => $status.attr("data-state") === status.toLowerCase());
    });
    return this;
  }

  /**
   * Serve chat from visitor
   * @returns ZendeskDashboardPage
   */
  answerChatFromVisitor() {
    cy.waitUntil(() =>
      cy
        .get('[data-test-id="toolbar-serve-chat-button"]')
        .as("acceptChat")
        .then(($button) => $button.attr("data-state") !== "disabled")
    )
      .get("@acceptChat")
      .click();
    return this;
  }

  /**
   * Respond to chat as an agent
   * @param reply
   * @returns ZendeskDashboardPage
   */
  replyChatAsAgent(reply: string) {
    cy.get('[data-test-id="omnicomposer-plain-text-ckeditor"]').type(
      `${reply}{enter}`
    );
    return this;
  }

  private createChatIframeCustomCommand() {
    return cy.origin(this.chatUrl, () => {
      Cypress.Commands.add("getIframe", (iframe) => {
        const getIframeDocument = (iframe: string) => {
          return cy.get(iframe).its("0.contentDocument").should("exist");
        };

        getIframeDocument(iframe)
          .its("body")
          .should("not.be.undefined")
          .then(cy.wrap);
      });
    });
  }

  /**
   * Initiate a chat as a visitor
   * @param message to start a chat
   * @returns
   */
  private startChatSimulator(
    message?: string,
    isMessagingEnabled: boolean = true
  ) {
    return this.createChatIframeCustomCommand().then(() => {
      return cy.session("visitor", () => {
        cy.origin(
          this.chatUrl,
          { args: { message, isMessagingEnabled } },
          ({ message, isMessagingEnabled }) => {
            cy.visit("/landing/simulatev2", {
              qs: {
                id: Cypress.env("BASE_URL").replace("https://", ""),
                ww: true,
                lang: "en",
                fallbackAccountKey: Cypress.env("ZENDESK_CHAT_ACCOUNT_KEY"),
              },
            });

            if (isMessagingEnabled) {
              cy.getIframe('iframe[title="Button to launch messaging window"]')
                .find('[data-garden-id="buttons.icon_button"]')
                .should("be.visible")
                .trigger("mouseover")
                .click()
                .getIframe('iframe[title="Messaging window"]')
                .should("be.visible")
                .find('[data-garden-id="forms.input"]')
                .type(`Cypress Visitor ${Date.now().toString(36)}{enter}`)
                .getIframe('iframe[title="Messaging window"]')
                .contains("Connecting you with someone now.")
                .should("be.visible");

              if (message) {
                cy.getIframe('iframe[title="Messaging window"]')
                  .find('[data-garden-id="forms.textarea"]:visible')
                  .type(`${message}{enter}`);
              }
            } else {
              cy.getIframe('iframe[id="launcher"]')
                .find('[data-testid="launcher"]')
                .should("be.visible")
                .trigger("mouseover")
                .click()
                .getIframe('iframe[id="webWidget"]')
                .should("be.visible");

              if (message) {
                cy.getIframe('iframe[id="webWidget"]')
                  .find('[data-testid="message-field"]')
                  .type(`${message}{enter}`);
              }
            }
          }
        );
      });
    });
  }

  /**
   * Initiate a chat as a visitor
   * @param message to start a chat
   * @returns ZendeskDashboardPage
   */
  createChatAsVisitor(message?: string, isMessagingEnabled: boolean = true) {
    this.startChatSimulator(message, isMessagingEnabled).then(() => {
      cy.origin(
        this.chatUrl,
        { args: { isMessagingEnabled } },
        ({ isMessagingEnabled }) => {
          cy.visit("/landing/simulatev2", {
            qs: {
              id: Cypress.env("BASE_URL").replace("https://", ""),
              ww: true,
              lang: "en",
              fallbackAccountKey: Cypress.env("ZENDESK_CHAT_ACCOUNT_KEY"),
            },
          });

          if (!isMessagingEnabled) {
            cy.getIframe('iframe[id="launcher"]')
              .find('[data-testid="launcher"]')
              .should("be.visible")
              .trigger("mouseover")
              .click()
              .getIframe('iframe[id="webWidget"]')
              .should("be.visible");
          }
        }
      );
      cy.wait(5000); // wait 30s before answering/abandoning chat
    });
    return this;
  }

  /**
   * Reply to chat as a visitor
   * @param message reply
   * @returns ZendeskDashboardPage
   */
  replyChatAsVisitor(message?: string, isMessagingEnabled: boolean = true) {
    this.startChatSimulator(message, isMessagingEnabled).then(() => {
      cy.origin(
        this.chatUrl,
        { args: { message, isMessagingEnabled } },
        ({ message, isMessagingEnabled }) => {
          cy.visit("/landing/simulatev2", {
            qs: {
              id: Cypress.env("BASE_URL").replace("https://", ""),
              ww: true,
              lang: "en",
              fallbackAccountKey: Cypress.env("ZENDESK_CHAT_ACCOUNT_KEY"),
            },
          });

          if (isMessagingEnabled) {
            if (message) {
              cy.getIframe('iframe[title="Messaging window"]')
                .find('[data-garden-id="forms.textarea"]:visible')
                .type(`${message}{enter}`)
                .getIframe('iframe[title="Messaging window"]')
                .contains("Connecting you with someone now.")
                .should("be.visible");
            }
          } else {
            cy.getIframe('iframe[id="launcher"]')
              .find('[data-testid="launcher"]')
              .should("be.visible")
              .trigger("mouseover")
              .click()
              .getIframe('iframe[id="webWidget"]')
              .should("be.visible");
            if (message) {
              cy.getIframe('iframe[id="webWidget"]')
                .find('[data-testid="message-field"]')
                .type(`${message}{enter}`);
            }
          }
        }
      );
    });

    return this;
  }

  /**
   * End chat simulation as visitor
   * @param params rate or abandon chat
   * @param message to send before ending chat as visitor
   * @returns ZendeskDashboardPage
   */
  endChatAsVisitor(
    params: {
      rateChat: boolean;
      comment?: string;
      isPositive?: boolean;
      isAbandoned?: boolean;
    },
    message?: string,
    isMessagingEnabled: boolean = true
  ) {
    this.startChatSimulator(message, isMessagingEnabled).then(() => {
      cy.origin(
        this.chatUrl,
        { args: { params, message, isMessagingEnabled } },
        ({ params, message, isMessagingEnabled }) => {
          cy.visit("/landing/simulatev2", {
            qs: {
              id: Cypress.env("BASE_URL").replace("https://", ""),
              ww: true,
              lang: "en",
              fallbackAccountKey: Cypress.env("ZENDESK_CHAT_ACCOUNT_KEY"),
            },
          });

          if (isMessagingEnabled) {
            if (message) {
              cy.getIframe('iframe[title="Messaging window"]')
                .find('[data-garden-id="forms.textarea"]:visible')
                .type(`${message}{enter}`);
            }

            if (params.rateChat === true) {
              if (params.isPositive === true) {
                cy.getIframe('iframe[title="Messaging window"]')
                  .contains('[data-garden-id="buttons.button"]', "Good")
                  .should("be.visible")
                  .click();
              } else if (params.isPositive === false) {
                cy.getIframe('iframe[title="Messaging window"]')
                  .contains('[data-garden-id="buttons.button"]', "Bad")
                  .should("be.visible")
                  .click();
              }
            }
          } else {
            cy.getIframe('iframe[id="launcher"]')
              .find('[data-testid="launcher"]')
              .should("be.visible")
              .trigger("mouseover")
              .click()
              .getIframe('iframe[id="webWidget"]')
              .should("be.visible");
            if (message) {
              cy.getIframe('iframe[id="webWidget"]')
                .find('[data-testid="message-field"]')
                .type(`${message}{enter}`);
            }

            cy.getIframe('iframe[id="webWidget"]')
              .find('[data-testid="Icon--endChat"]')
              .should("be.visible")
              .trigger("mouseover")
              .click()
              .getIframe('iframe[id="webWidget"]')
              .find('[data-testid="button-ok"]')
              .should("be.visible")
              .click();

            if (params.rateChat === true) {
              if (params.comment) {
                cy.getIframe('iframe[id="webWidget"]')
                  .find('[data-testid="message-field"]')
                  .should("be.visible")
                  .type(`${params.comment}{enter}`);
              }

              if (params.isPositive === true) {
                cy.getIframe('iframe[id="webWidget"]')
                  .find('[data-testid="Icon--thumbUp"]')
                  .should("be.visible")
                  .click();
              } else if (params.isPositive === false) {
                cy.getIframe('iframe[id="webWidget"]')
                  .find('[data-testid="Icon--thumbDown"]')
                  .should("be.visible")
                  .click();
              }
              cy.getIframe('iframe[id="webWidget"]')
                .contains("Send")
                .should("be.visible")
                .click();
            } else if (params.isAbandoned !== true) {
              cy.getIframe('iframe[id="webWidget"]')
                .contains("Skip")
                .should("be.visible")
                .click();
            }
          }
        }
      );
    });

    return this;
  }
}
