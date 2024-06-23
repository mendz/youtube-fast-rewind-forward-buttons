class SupportLinks extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'closed' });

    shadow.innerHTML = /* html */ `
         <style>
            div {
                flex-direction: column;
                align-items: center;
                gap: 5px;
                padding: 10px;
                display: flex;
                text-align: center;

                & a {
                    cursor: pointer;
                }

                & a#rate-us {
                    color: #18272f;
                    position: relative;
                    text-decoration: none;
                    display: inline-block;
                    max-width: 300px;

                    background-color: #afe2ed;
                    border-radius: 5px;
                    box-shadow: 4px 3px 6px 0px rgba(0, 0, 0, 0.57);
                    padding: 0.5rem;

                    &::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 4px;
                    border-radius: 4px;
                    background-color: #18272f;
                    bottom: -4px;
                    left: 0;
                    transform-origin: right;
                    transform: scaleX(0);
                    transition: transform 0.3s ease-in-out;
                    }

                    &:hover::before {
                    transform-origin: left;
                    transform: scaleX(1);
                    }
                }
            }

                </style>

                <div>
                    <a href="https://www.buymeacoffee.com/leizerovich.mendy" target="_blank"><img
                        src="https://cdn.buymeacoffee.com/buttons/v2/lato-yellow.png" alt="Buy Me A Coffee"
                        style="height: 60px !important; width: 217px !important" /></a>
                    <a href="https://chromewebstore.google.com/detail/youtube-rewind-fast-forwa/bmdiaadnpgbbfepggiiajgadlhhcphgk"
                    target="_blank" id="rate-us">Love the Extension? Please leave a review on the Chrome Web Store!</a>
                </div>
`;
  }
}

customElements.define('support-links', SupportLinks);
