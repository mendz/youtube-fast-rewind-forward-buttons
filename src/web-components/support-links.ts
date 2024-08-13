class SupportLinks extends HTMLElement {
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'closed' });

    const cssURL = chrome.runtime.getURL('web-components/support-links.css');
    const responseCSS = await fetch(cssURL);
    const cssStyles = await responseCSS.text();

    shadow.innerHTML = /* html */ `
        <style>${cssStyles}</style>

        <div>
            <a href="https://www.buymeacoffee.com/leizerovich.mendy" target="_blank"><img
                    src="https://cdn.buymeacoffee.com/buttons/v2/lato-yellow.png" alt="Buy Me A Coffee"
                    style="height: 60px !important; width: 217px !important" /></a>
            <a href="https://chromewebstore.google.com/detail/youtube-rewind-fast-forwa/bmdiaadnpgbbfepggiiajgadlhhcphgk/reviews"
            target="_blank" id="rate-us">Love the Extension? Please leave a review on the Chrome Web Store!</a>
        </div>
`;
  }
}

customElements.define('support-links', SupportLinks);
