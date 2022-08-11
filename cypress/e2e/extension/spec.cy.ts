describe('empty spec', () => {
  it('passes', () => {
    cy.visit('https://www.youtube.com/watch?v=BVKVeqVIeHQ');
    cy.videoMute();
    cy.videoPause();
    // cy.visit('chrome-extension://cdafjeecghnliknjmjpdcpbfkdibolge/options.2dedf788.html');
  });
});
