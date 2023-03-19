export class ZendeskTicket {
  private clickAdd() {
    cy.get('[data-test-id="header-toolbar-add-menu-button"]').click();
    return this;
  }

  private addSubject() {
    cy.get('[data-test-id="omni-header-subject"]')
      .click()
      .type(`Cypress ticket ${new Date().toDateString()}{enter}`);
    return this;
  }

  private addComment(comment: string) {
    cy.get('[data-test-id="omnicomposer-rich-text-ckeditor"]').type(comment);
    cy.get('[data-test-id="omnicomposer-rich-text-ckeditor"]').should(
      "have.text",
      comment
    );
    return this;
  }

  private waitForSpinner() {
    cy.get("div").find(".ticket-working-spinner").should("not.exist");
    return this;
  }

  /**
   * Open a new ticket without submiting
   * @returns ZendeskDashboardPage
   */
  draftTicket() {
    this.clickAdd();
    cy.get('[data-test-id="header-toolbar-add-menu-new-ticket"]').click();
    return this;
  }

  /**
   * Open and submit a new ticket
   * @returns ZendeskDashboardPage
   */
  createTicket(isPublic: boolean = true) {
    this.draftTicket();
    this.addSubject();
    this.updateTicket(isPublic);
    this.submitTicket();
    return this;
  }

  /**
   * Add a comment to ticket
   * @returns ZendeskDashboardPage
   */
  updateTicket(isPublic: boolean = true) {
    const date = new Date().toISOString();
    // public comment
    cy.get('[data-test-id="omnicomposer-rich-text-ckeditor"]').click();
    if (isPublic === false) {
      // internal comment
      cy.get('[data-test-id="omnichannel-channel-switcher-button"]')
        .click()
        .then(() => {
          cy.get(
            '[data-test-id="omnichannel-channel-switcher-menuitem-internal"]'
          ).click();
        });
    }
    this.addComment(`Cypress ticket update: ${date}`);
    return this;
  }

  /**
   * Submit ticket
   * @returns ZendeskDashboardPage
   */
  submitTicket(status?: string) {
    if (status == null) {
      cy.get('[data-test-id="submit_button-button"]').click();
    } else {
      cy.get('[data-test-id="submit_button-menu-button"]').click();
      cy.get(`[data-test-id="submit_button-menu-${status}"]`).click();
    }
    this.waitForSpinner();
    return this;
  }
}
