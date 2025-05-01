import { IOptions, IStorageOptions } from '../../content/types';

export const MOCK_HTML = /* HTML */ `
  <header class="container-fluid">
    <hgroup>
      <h1>YouTube Rewind & Fast Forward Buttons - Settings</h1>
      <p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
        >
          <path
            d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
          />
        </svg>
        As a default, the arrow keys rewind (left arrow) & forward (right arrow)
        are set to <strong>5 seconds</strong>.
      </p>
    </hgroup>
  </header>
  <aside>
    <support-links></support-links>
  </aside>
  <main class="container">
    <article>
      <form class="container">
        <div class="seconds-change-container grid">
          <label class="seconds-change-label">
            Rewind seconds (1-7200 sec):
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
            <small id="rewindValue" for="rewind">(5 seconds)</small>
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
            <small id="forwardValue" for="forward">(5 seconds)</small>
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
          <fieldset disabled class="grid">
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
              <small id="rewind-secondaryValue" for="rewind-secondary"
                >(5 seconds)</small
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
              <small id="forward-secondaryValue" for="forward-secondary"
                >(5 seconds)</small
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
            Should override the keyboard media keys with the above seconds to
            behave as the arrow keys?
          </label>
        </div>
        <div class="grid">
          <button type="button" id="reset-values" class="secondary">
            Reset values to default
          </button>
          <button type="submit">Save and close</button>
        </div>
      </form>
    </article>
  </main>
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
