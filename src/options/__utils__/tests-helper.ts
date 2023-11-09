import { IOptions, IStorageOptions } from '../../content/types';

export const MOCK_HTML = /* HTML */ `
  <h1>YouTube Rewind & Fast Forward Buttons - Options</h1>
  <button type="button" class="danger" id="reset-values">
    Reset input values to default
  </button>
  <form class="container">
    <div class="seconds-change">
      <label
        >Rewind seconds (between 1 and 60):
        <input
          type="number"
          id="rewind"
          name="rewind"
          min="1"
          max="60"
          value="5"
        />
      </label>
      <label
        >Forward seconds (between 1 and 60):
        <input
          type="number"
          id="forward"
          name="forward"
          min="1"
          max="60"
          value="5"
        />
      </label>
    </div>
    <div class="override-keys-container">
      <p>
        <svg
          id="information"
          class="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          aria-labelledby="informationTitle"
          role="img"
        >
          <title id="informationTitle">Information</title>
          <path
            d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 11v4h2V9H9v2zm0-6v2h2V5H9z"
          />
        </svg>
        As a default, the arrow keys rewind (left arrow) & forward (right arrow)
        are set to <strong>5 seconds</strong>.
      </p>
      <label>
        <input
          type="checkbox"
          name="override-arrow-keys"
          id="override-arrow-keys"
        />
        Should the options above override the native arrow keys seconds?
      </label>
      <label>
        <input
          type="checkbox"
          name="override-media-kays"
          id="override-media-kays"
        />
        Should override the keyboard media keys above to behave as the arrow
        keys?
      </label>
    </div>
    <div class="button-container">
      <button type="submit">Save and close</button>
    </div>
  </form>
`;

export enum InputId {
  REWIND = 'rewind',
  FORWARD = 'forward',
  OVERRIDE_ARROW_KEYS = 'override-arrow-keys',
  OVERRIDE_MEDIA_KAYS = 'override-media-kays',
  SHOULD_SHOW_BUTTONS_TOOLTIP = 'should-show-buttons-tooltip',
}

export const INPUTS_IDS = Object.values(InputId);

export const DEFAULT_OPTIONS_MOCK: IOptions = {
  forwardSeconds: 5,
  rewindSeconds: 5,
  shouldOverrideArrowKeys: false,
  shouldOverrideMediaKeys: false,
  shouldShowButtonsTooltip: true,
};

export const DEFAULT_STORAGE_OPTIONS_MOCK: IStorageOptions = {
  rewindSeconds: '5',
  forwardSeconds: '5',
  shouldOverrideKeys: true,
  shouldOverrideArrowKeys: false,
  shouldOverrideMediaKeys: false,
  shouldShowButtonsTooltip: true,
};
