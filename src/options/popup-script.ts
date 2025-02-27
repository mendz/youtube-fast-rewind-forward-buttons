import { numberFormat } from '../content/helper';
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

const prevSecondsValues = {
  rewind: '5',
  forward: '5',
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
    '#override-media-keys'
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
    const keys = Object.keys(OPTIONS_DEFAULT_VALUES) as Array<
      keyof IStorageOptions
    >;
    const storageOptions = await chrome.storage.sync.get<IStorageOptions>(keys);

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

function setSecondsInputsListeners(id: 'forward' | 'rewind'): void {
  const input = document.querySelector(`#${id}`) as HTMLInputElement;
  const value = document.querySelector(`#${id}Value`) as HTMLOutputElement;
  value.textContent = `(${numberFormat(Number(input.value))})`;

  input.addEventListener('input', (event: Event) => {
    const target = event.target as HTMLInputElement;
    let valueNumber = Number(target.value);

    if (valueNumber > 7200) {
      target.value = prevSecondsValues[id];
      valueNumber = Number(prevSecondsValues[id]);
    } else {
      prevSecondsValues[id] = target.value;
    }

    value.textContent = `(${numberFormat(valueNumber)})`;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('form.container')?.addEventListener('submit', submit);
  document
    .querySelector('button#reset-values')
    ?.addEventListener('click', resetToDefaultOptions);
  await loadInputStorageOptions();
  setSecondsInputsListeners('rewind');
  setSecondsInputsListeners('forward');
});
