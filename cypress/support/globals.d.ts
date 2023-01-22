/// <reference types="cypress" />

declare namespace angular {
  interface Scope {
    [key: string]: any;
  }
  function element(selector: any): any;
}
