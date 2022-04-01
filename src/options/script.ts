const OPTIONS_DEFAULT_VALUES: Readonly<IOptions> = {
  rewindSeconds: 5,
  forwardSeconds: 5,
  shouldOverrideKeys: false,
};

type InputsOptionsPage = {
  inputRewindSeconds: HTMLInputElement;
  inputForwardSeconds: HTMLInputElement;
  InputShouldOverrideKeys: HTMLInputElement;
};

function getInputs(): InputsOptionsPage {
  const inputRewindSeconds: HTMLInputElement = document.querySelector(
    '#rewind'
  ) as HTMLInputElement;
  const inputForwardSeconds: HTMLInputElement = document.querySelector(
    '#forward'
  ) as HTMLInputElement;
  const InputShouldOverrideKeys: HTMLInputElement = document.querySelector(
    '#override-keys'
  ) as HTMLInputElement;
  return {
    inputRewindSeconds,
    inputForwardSeconds,
    InputShouldOverrideKeys,
  };
}

async function saveOptions(): Promise<void> {
  const {
    inputRewindSeconds: rewindSeconds,
    inputForwardSeconds: forwardSeconds,
    InputShouldOverrideKeys: shouldOverrideKeys,
  } = getInputs();
  try {
    await chrome.storage.sync.set({
      rewindSeconds: rewindSeconds.value,
      forwardSeconds: forwardSeconds.value,
      shouldOverrideKeys: shouldOverrideKeys.checked,
    });
    console.info('options saved!');
    window.close();
  } catch (error) {
    console.error(error);
  }
}

async function loadStorageOptions(): Promise<void> {
  const { inputRewindSeconds, inputForwardSeconds, InputShouldOverrideKeys } =
    getInputs();
  try {
    const storageOptions: IStorageOptions = (await chrome.storage.sync.get([
      'rewindSeconds',
      'forwardSeconds',
      'shouldOverrideKeys',
    ])) as IStorageOptions;

    // set the inputs with the loaded options
    inputRewindSeconds.value =
      storageOptions?.rewindSeconds ??
      OPTIONS_DEFAULT_VALUES.rewindSeconds.toString();
    inputForwardSeconds.value =
      storageOptions?.forwardSeconds ??
      OPTIONS_DEFAULT_VALUES.forwardSeconds.toString();
    InputShouldOverrideKeys.checked =
      storageOptions?.shouldOverrideKeys ??
      OPTIONS_DEFAULT_VALUES.shouldOverrideKeys;
  } catch (error) {
    console.error(error);
  }
}

async function resetToDefaultOptions(): Promise<void> {
  /* eslint-disable-next-line no-alert, no-restricted-globals */
  const result = confirm('Are you sure?');
  if (!result) {
    return;
  }
  const { inputRewindSeconds, inputForwardSeconds, InputShouldOverrideKeys } =
    getInputs();
  try {
    await chrome.storage.sync.set(OPTIONS_DEFAULT_VALUES);
    console.info('options saved with default values!');
    inputRewindSeconds.value = OPTIONS_DEFAULT_VALUES.rewindSeconds.toString();
    inputForwardSeconds.value =
      OPTIONS_DEFAULT_VALUES.forwardSeconds.toString();
    InputShouldOverrideKeys.checked = OPTIONS_DEFAULT_VALUES.shouldOverrideKeys;
  } catch (error) {
    console.error(error);
  }
}

function submit(event: Event): void {
  event.preventDefault();
  const form: HTMLFormElement = document.querySelector(
    'form.container'
  ) as HTMLFormElement;
  const isValid: boolean = form.reportValidity();
  if (isValid) {
    saveOptions();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form.container')?.addEventListener('submit', submit);
  document
    .querySelector('button#reset-values')
    ?.addEventListener('click', resetToDefaultOptions);
  loadStorageOptions();
});
