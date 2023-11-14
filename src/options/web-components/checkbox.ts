class ToggleCheckbox extends HTMLElement {
  #checkbox: HTMLInputElement;
  #shadowRoot: ShadowRoot;

  constructor() {
    super();

    // Attach a shadow DOM to encapsulate the component's styles and structure
    this.#shadowRoot = this.attachShadow({ mode: 'open' });

    // Clone the template content into the shadow DOM
    const template = document.getElementById(
      'toggle-checkbox'
    )! as HTMLTemplateElement;
    const instance = template.content.cloneNode(true);
    this.#shadowRoot.appendChild(instance);

    // Get the input element and label text slot
    this.#checkbox = this.#shadowRoot.querySelector('input')!;
  }

  static get observedAttributes() {
    return ['id', 'label'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // React to changes in attributes
    switch (name) {
      case 'id':
        this.#checkbox.id = newValue;
        this.#checkbox.name = newValue;
        break;
      case 'label':
        // Update the label text in the slot
        this.updateLabelText(newValue);
        break;
    }
  }

  // Method to update the label text in the slot
  updateLabelText(text: string) {
    const label = this.#shadowRoot.querySelector('span.label-text')!;
    label.textContent = text;
  }
}

// Register the CurrentDate component using the tag name <current-date>.
window.customElements.define('toggle-checkbox', ToggleCheckbox);
