const DEFAULT_VALUES = {
  rewindSeconds: 5,
  forwardSeconds: 5,
  shouldOverrideKeys: false,
};

function getInputs() {
  const rewindSeconds = document.querySelector('#rewind');
  const forwardSeconds = document.querySelector('#forward');
  const shouldOverrideKeys = document.querySelector('#override-keys');
  return {
    rewindSeconds,
    forwardSeconds,
    shouldOverrideKeys,
  };
}

function saveOptions() {
  const { rewindSeconds, forwardSeconds, shouldOverrideKeys } = getInputs();
  chrome.storage.sync.set(
    {
      rewindSeconds: rewindSeconds.value,
      forwardSeconds: forwardSeconds.value,
      shouldOverrideKeys: shouldOverrideKeys.checked,
    },
    () => {
      const error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      } else {
        console.info('options saved!');
        window.close();
      }
    }
  );
}

function loadOptions() {
  const { rewindSeconds, forwardSeconds, shouldOverrideKeys } = getInputs();
  chrome.storage.sync.get(
    ['rewindSeconds', 'forwardSeconds', 'shouldOverrideKeys'],
    (options) => {
      const error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
        return;
      }
      rewindSeconds.value =
        options?.rewindSeconds ?? DEFAULT_VALUES.rewindSeconds;
      forwardSeconds.value =
        options?.forwardSeconds ?? DEFAULT_VALUES.forwardSeconds;
      shouldOverrideKeys.checked =
        options?.shouldOverrideKeys ?? DEFAULT_VALUES.shouldOverrideKeys;
    }
  );
}

function resetToDefault() {
  /* eslint-disable-next-line no-alert, no-restricted-globals */
  const result = confirm('Are you sure?');
  if (!result) {
    return;
  }
  const { rewindSeconds, forwardSeconds, shouldOverrideKeys } = getInputs();
  chrome.storage.sync.set(DEFAULT_VALUES, () => {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    } else {
      console.info('options saved with default values!');
      rewindSeconds.value = DEFAULT_VALUES.rewindSeconds;
      forwardSeconds.value = DEFAULT_VALUES.forwardSeconds;
      shouldOverrideKeys.checked = DEFAULT_VALUES.shouldOverrideKeys;
    }
  });
}

/**
 *
 * @param {InputEvent} event
 */
function submit(event) {
  event.preventDefault();
  const form = document.querySelector('form.container');
  const isValid = form.reportValidity();
  if (isValid) {
    saveOptions();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector('form.container button[type="submit"]')
    .addEventListener('click', submit);
  document
    .querySelector('button#reset-values')
    .addEventListener('click', resetToDefault);
  loadOptions();
});
