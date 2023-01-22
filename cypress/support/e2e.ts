import "./commands";
import addContext = require("mochawesome/addContext");

const registerCypressGrep = require("@cypress/grep");
registerCypressGrep();

require("cypress-failed-log");

Cypress.on("test:after:run", (test, runnable) => {
  if (test.state === "failed") {
    let item = runnable;
    const nameParts = [runnable.title];

    // Iterate through all parents and grab the titles
    while (item.parent) {
      nameParts.unshift(item.parent.title);
      item = item.parent;
    }

    // generating filename like cypress screenshot names
    const fullTestName = nameParts
      .filter(Boolean)
      .join(" -- ")
      .replace(/"/g, "");

    const imageUrl = `screenshots/${Cypress.spec.name}/${fullTestName} (failed).png`;

    // adding context to generated output json. This will be used to render images and screenshot in reports.
    addContext({ test }, imageUrl);
    addContext(
      { test },
      { title: "Video", value: `videos/${Cypress.spec.name}.mp4` }
    );
  }
});

const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
Cypress.on("uncaught:exception", (err) => {
  /* returning false here prevents Cypress from failing the test */
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});
