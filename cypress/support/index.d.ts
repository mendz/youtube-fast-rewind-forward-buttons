/* eslint-disable @typescript-eslint/no-unused-vars */
declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to ... add your description here
     * @example cy.clickOnMyJourneyInCandidateCabinet()
     */
    getVideo(): Chainable<JQuery<HTMLVideoElement>>;
    videoPause(): Chainable<void>;
    videoPlay(): Chainable<void>;
    videoMute(): Chainable<void>;
  }
}
