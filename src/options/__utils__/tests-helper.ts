import { IOptions, IStorageOptions } from '../../content/types';

export const MOCK_HTML = /* HTML */ `
  <h1>YouTube Rewind & Fast Forward Buttons - Options</h1>
  <button type="button" class="danger" id="reset-values">
    Reset input values to default
  </button>
  <form class="container">
    <div class="seconds-change-container">
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
      <label class="seconds-change-label"
        >Rewind seconds (1-7200 sec):
        <input
          required
          type="number"
          id="rewind"
          name="rewind"
          min="1"
          max="7200"
          value="5"
          placeholder="Seconds"
        />
        <output id="rewindValue" for="rewind">(5 seconds)</output>
      </label>
      <label class="seconds-change-label"
        >Forward seconds (1-7200 sec):
        <input
          required
          type="number"
          id="forward"
          name="forward"
          min="1"
          max="7200"
          value="5"
          placeholder="Seconds"
        />
        <output id="forwardValue" for="forward">(5 seconds)</output>
      </label>
    </div>
    <div class="secondary-seconds-container">
      <label>
        <input
          type="checkbox"
          name="enable-more-buttons"
          id="enable-more-buttons"
        />
        Enable the secondary buttons
      </label>
      <fieldset disabled>
        <label class="seconds-change-label"
          >Rewind seconds (1-7200 sec):
          <input
            required
            type="number"
            id="rewind-secondary"
            name="rewind-secondary"
            min="1"
            max="7200"
            value="5"
            placeholder="Seconds"
          />
          <output id="rewind-secondaryValue" for="rewind-secondary"
            >(5 seconds)</output
          >
        </label>
        <label class="seconds-change-label"
          >Forward seconds (1-7200 sec):
          <input
            required
            type="number"
            id="forward-secondary"
            name="forward-secondary"
            min="1"
            max="7200"
            value="5"
            placeholder="Seconds"
          />
          <output id="forward-secondaryValue" for="forward-secondary"
            >(5 seconds)</output
          >
        </label>
      </fieldset>
    </div>
    <div class="checkbox-container">
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
          name="override-media-keys"
          id="override-media-keys"
        />
        Should override the keyboard media keys with the above seconds to behave
        as the arrow keys?
      </label>
    </div>
    <div class="button-container">
      <button type="button" class="danger" id="reset-values">
        Reset input values to default
      </button>
      <button type="submit">Save and close</button>
    </div>
  </form>
`;

export enum InputId {
  REWIND = 'rewind',
  FORWARD = 'forward',
  OVERRIDE_ARROW_KEYS = 'override-arrow-keys',
  OVERRIDE_MEDIA_KEYS = 'override-media-keys',
  ENABLE_MORE_BUTTONS = 'enable-more-buttons',
  REWIND_SECONDARY = 'rewind-secondary',
  FORWARD_SECONDARY = 'forward-secondary',
}

export const INPUTS_IDS = Object.values(InputId);

export const DEFAULT_OPTIONS_MOCK: IOptions = {
  forwardSeconds: 5,
  rewindSeconds: 5,
  shouldOverrideArrowKeys: false,
  shouldOverrideMediaKeys: false,
  secondarySeconds: {
    checkboxIsEnabled: false,
    rewindSeconds: 5,
    forwardSeconds: 5,
  },
};

export const DEFAULT_STORAGE_OPTIONS_MOCK: IStorageOptions = {
  rewindSeconds: '5',
  forwardSeconds: '5',
  shouldOverrideKeys: true,
  shouldOverrideArrowKeys: false,
  shouldOverrideMediaKeys: false,
  secondarySeconds: {
    checkboxIsEnabled: false,
    rewindSeconds: '5',
    forwardSeconds: '5',
  },
};
