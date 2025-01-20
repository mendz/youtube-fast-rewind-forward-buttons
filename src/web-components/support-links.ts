class SupportLinks extends HTMLElement {
  async connectedCallback() {
    const isDev = process.env.NODE_ENV === 'development';
    const shadow = this.attachShadow({ mode: isDev ? 'open' : 'closed' });

    const cssURL = chrome.runtime.getURL('web-components/support-links.css');
    fetch(cssURL)
      .then((response) => response.text())
      .then((cssStyles) => {
        shadow.innerHTML += `<style>${cssStyles}</style>`;
      });

    shadow.innerHTML = /* html */ `
        <div>
            <a href="https://www.buymeacoffee.com/leizerovich.mendy" target="_blank"><img
                    src="https://cdn.buymeacoffee.com/buttons/v2/lato-yellow.png" alt="Buy Me A Coffee"
                    style="height: 60px !important; width: 217px !important" /></a>
            <a href="https://chromewebstore.google.com/detail/youtube-rewind-fast-forwa/bmdiaadnpgbbfepggiiajgadlhhcphgk/reviews"
            target="_blank" id="rate-us">Love the extension? Please leave a review on the Chrome Web Store!</a>
        </div>
`;
  }
}

customElements.define('support-links', SupportLinks);
