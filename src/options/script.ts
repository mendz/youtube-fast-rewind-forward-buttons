import { IOptions, IStorageOptions } from '../content/types';

const OPTIONS_DEFAULT_VALUES: Readonly<IOptions> = {
  rewindSeconds: 5,
  forwardSeconds: 5,
  shouldOverrideKeys: false, // TODO: old one, should removed in the next version
  shouldOverrideArrowKeys: false,
  shouldOverrideMediaKeys: false,
};

type InputsOptionsPage = {
  inputRewindSeconds: HTMLInputElement;
  inputForwardSeconds: HTMLInputElement;
  inputShouldOverrideArrowKeys: HTMLInputElement;
  inputShouldOverrideMediaKeys: HTMLInputElement;
};

export function getInputs(): InputsOptionsPage {
  const inputRewindSeconds: HTMLInputElement = document.querySelector(
    '#rewind'
  ) as HTMLInputElement;
  const inputForwardSeconds: HTMLInputElement = document.querySelector(
    '#forward'
  ) as HTMLInputElement;
  const inputShouldOverrideArrowKeys: HTMLInputElement = document.querySelector(
    '#override-arrow-keys'
  ) as HTMLInputElement;
  const inputShouldOverrideMediaKeys: HTMLInputElement = document.querySelector(
    '#override-media-kays'
  ) as HTMLInputElement;

  return {
    inputRewindSeconds,
    inputForwardSeconds,
    inputShouldOverrideArrowKeys,
    inputShouldOverrideMediaKeys,
  };
}

export async function saveOptions(): Promise<void> {
  const {
    inputRewindSeconds: rewindSeconds,
    inputForwardSeconds: forwardSeconds,
    inputShouldOverrideArrowKeys: shouldOverrideArrowKeys,
    inputShouldOverrideMediaKeys: shouldOverrideMediaKeys,
  } = getInputs();
  try {
    await chrome.storage.sync.set({
      rewindSeconds: rewindSeconds.value,
      forwardSeconds: forwardSeconds.value,
      shouldOverrideArrowKeys: shouldOverrideArrowKeys.checked,
      shouldOverrideMediaKeys: shouldOverrideMediaKeys.checked,
    });
    console.info('options saved!');
    window.close();
  } catch (error) {
    console.error(error);
  }
}

export function handleOverrideKeysMigration(
  inputShouldOverrideArrowKeys: HTMLInputElement,
  storageOptions: IStorageOptions
) {
  // check if there is a value on shouldOverrideKeys, if so use it
  // could be undefined if it wasn't set before or false which it ok to use the new value
  if (storageOptions?.shouldOverrideKeys) {
    inputShouldOverrideArrowKeys.checked =
      storageOptions.shouldOverrideKeys ??
      OPTIONS_DEFAULT_VALUES.shouldOverrideArrowKeys;
  } else {
    inputShouldOverrideArrowKeys.checked =
      storageOptions?.shouldOverrideArrowKeys ??
      OPTIONS_DEFAULT_VALUES.shouldOverrideArrowKeys;
  }
}

export async function loadInputStorageOptions(): Promise<void> {
  const {
    inputRewindSeconds,
    inputForwardSeconds,
    inputShouldOverrideArrowKeys,
    inputShouldOverrideMediaKeys,
  } = getInputs();
  try {
    const storageOptions: IStorageOptions = (await chrome.storage.sync.get(
      Object.keys(OPTIONS_DEFAULT_VALUES)
    )) as IStorageOptions;

    // set the inputs with the loaded options
    inputRewindSeconds.value =
      storageOptions?.rewindSeconds ??
      OPTIONS_DEFAULT_VALUES.rewindSeconds.toString();
    inputForwardSeconds.value =
      storageOptions?.forwardSeconds ??
      OPTIONS_DEFAULT_VALUES.forwardSeconds.toString();
    handleOverrideKeysMigration(inputShouldOverrideArrowKeys, storageOptions);
    inputShouldOverrideMediaKeys.checked =
      storageOptions?.shouldOverrideMediaKeys ??
      OPTIONS_DEFAULT_VALUES.shouldOverrideMediaKeys;
  } catch (error) {
    console.error(error);
  }
}

export async function resetToDefaultOptions(): Promise<void> {
  /* eslint-disable-next-line no-alert, no-restricted-globals */
  const result = window.confirm('Are you sure?');
  if (!result) {
    return;
  }
  const {
    inputRewindSeconds,
    inputForwardSeconds,
    inputShouldOverrideArrowKeys,
    inputShouldOverrideMediaKeys,
  } = getInputs();
  try {
    await chrome.storage.sync.set(OPTIONS_DEFAULT_VALUES);
    console.info('options saved with default values!');
    inputRewindSeconds.value = OPTIONS_DEFAULT_VALUES.rewindSeconds.toString();
    inputForwardSeconds.value =
      OPTIONS_DEFAULT_VALUES.forwardSeconds.toString();
    inputShouldOverrideArrowKeys.checked =
      OPTIONS_DEFAULT_VALUES.shouldOverrideArrowKeys;
    inputShouldOverrideMediaKeys.checked =
      OPTIONS_DEFAULT_VALUES.shouldOverrideMediaKeys;
  } catch (error) {
    console.error(error);
  }
}

export function submit(event: Event): void {
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
  loadInputStorageOptions();
});
