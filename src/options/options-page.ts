import { numberFormat } from '../content/helper';
import { IOptions, IStorageOptions, Prettify } from '../content/types';

const OPTIONS_DEFAULT_VALUES: Readonly<IOptions> = {
  rewindSeconds: 5,
  forwardSeconds: 5,
  secondarySeconds: {
    checkboxIsEnabled: false,
    rewindSeconds: 5,
    forwardSeconds: 5,
  },
  shouldOverrideKeys: false, // TODO: old one, should be removed in the next version
  shouldOverrideArrowKeys: false,
  shouldOverrideMediaKeys: false,
};

type InputsOptionsPage = {
  inputRewindSeconds: HTMLInputElement;
  inputForwardSeconds: HTMLInputElement;
  secondarySeconds: {
    checkboxIsEnabled: HTMLInputElement;
    inputRewindSeconds: HTMLInputElement;
    inputForwardSeconds: HTMLInputElement;
  };
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
  const enableSecondaryMoreButtonsInput: HTMLInputElement =
    document.querySelector('#enable-more-buttons') as HTMLInputElement;
  const inputSecondaryRewindSeconds: HTMLInputElement = document.querySelector(
    '#rewind-secondary'
  ) as HTMLInputElement;
  const inputSecondaryForwardSeconds: HTMLInputElement = document.querySelector(
    '#forward-secondary'
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
    secondarySeconds: {
      checkboxIsEnabled: enableSecondaryMoreButtonsInput,
      inputRewindSeconds: inputSecondaryRewindSeconds,
      inputForwardSeconds: inputSecondaryForwardSeconds,
    },
    inputShouldOverrideArrowKeys,
    inputShouldOverrideMediaKeys,
  };
}

export async function saveOptions(): Promise<void> {
  const {
    inputRewindSeconds: rewindSeconds,
    inputForwardSeconds: forwardSeconds,
    secondarySeconds: {
      checkboxIsEnabled: secondaryIsEnabled,
      inputRewindSeconds: secondaryRewindSeconds,
      inputForwardSeconds: secondaryForwardSeconds,
    },
    inputShouldOverrideArrowKeys: shouldOverrideArrowKeys,
    inputShouldOverrideMediaKeys: shouldOverrideMediaKeys,
  } = getInputs();
  try {
    await chrome.storage.sync.set<IStorageOptions>({
      rewindSeconds: rewindSeconds.value,
      forwardSeconds: forwardSeconds.value,
      secondarySeconds: {
        checkboxIsEnabled: secondaryIsEnabled.checked,
        rewindSeconds: secondaryRewindSeconds.value,
        forwardSeconds: secondaryForwardSeconds.value,
      },
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
    secondarySeconds,
    inputShouldOverrideArrowKeys,
    inputShouldOverrideMediaKeys,
  } = getInputs();
  try {
    const keys = Object.keys(OPTIONS_DEFAULT_VALUES) as Array<
      keyof IStorageOptions
    >;
    const storageOptions =
      await chrome.storage.sync.get<Prettify<IStorageOptions>>(keys);

    // set the inputs with the loaded options
    inputRewindSeconds.value =
      storageOptions?.rewindSeconds ??
      OPTIONS_DEFAULT_VALUES.rewindSeconds.toString();
    inputForwardSeconds.value =
      storageOptions?.forwardSeconds ??
      OPTIONS_DEFAULT_VALUES.forwardSeconds.toString();

    secondarySeconds.checkboxIsEnabled.checked =
      storageOptions?.secondarySeconds?.checkboxIsEnabled ?? false;
    secondarySeconds.inputRewindSeconds.value =
      storageOptions?.secondarySeconds?.rewindSeconds ??
      OPTIONS_DEFAULT_VALUES.secondarySeconds.rewindSeconds.toString();
    secondarySeconds.inputForwardSeconds.value =
      storageOptions?.secondarySeconds?.forwardSeconds ??
      OPTIONS_DEFAULT_VALUES.secondarySeconds.forwardSeconds.toString();

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
    secondarySeconds: {
      checkboxIsEnabled: inputSecondaryEnable,
      inputRewindSeconds: inputSecondaryRewindSeconds,
      inputForwardSeconds: inputSecondaryForwardSeconds,
    },
    inputShouldOverrideArrowKeys,
    inputShouldOverrideMediaKeys,
  } = getInputs();
  try {
    await chrome.storage.sync.set(OPTIONS_DEFAULT_VALUES);
    console.info('options saved with default values!');
    inputRewindSeconds.value = OPTIONS_DEFAULT_VALUES.rewindSeconds.toString();
    inputForwardSeconds.value =
      OPTIONS_DEFAULT_VALUES.forwardSeconds.toString();
    inputSecondaryEnable.checked =
      OPTIONS_DEFAULT_VALUES.secondarySeconds.checkboxIsEnabled;
    inputSecondaryRewindSeconds.value =
      OPTIONS_DEFAULT_VALUES.secondarySeconds.rewindSeconds.toString();
    inputSecondaryForwardSeconds.value =
      OPTIONS_DEFAULT_VALUES.secondarySeconds.forwardSeconds.toString();
    inputShouldOverrideArrowKeys.checked =
      OPTIONS_DEFAULT_VALUES.shouldOverrideArrowKeys;
    inputShouldOverrideMediaKeys.checked =
      OPTIONS_DEFAULT_VALUES.shouldOverrideMediaKeys;

    initializeOutputs();
    updateDisabledState();
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

function initializeSecondsInputOutputListeners(
  id: 'forward' | 'rewind' | 'forward-secondary' | 'rewind-secondary'
): void {
  const input = document.querySelector(`#${id}`) as HTMLInputElement;
  const value = document.querySelector(`#${id}Value`) as HTMLOutputElement;
  value.textContent = `(${numberFormat(Number(input.value))})`;

  const updateValue = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const valueNumber = Number(target.value);
    value.textContent = `(${numberFormat(valueNumber)})`;
  };

  input.removeEventListener('input', updateValue); // Remove any previous listeners
  input.addEventListener('input', updateValue);
}

function updateDisabledState() {
  const enableCheckbox = document.querySelector(
    '#enable-more-buttons'
  ) as HTMLInputElement;
  const secondaryFieldset = document.querySelector(
    '.secondary-seconds-container fieldset'
  ) as HTMLFieldSetElement;

  secondaryFieldset.disabled = !enableCheckbox.checked;
}

function initializeSecondaryEnable() {
  const enableCheckbox = document.querySelector(
    '#enable-more-buttons'
  ) as HTMLInputElement;

  updateDisabledState();

  enableCheckbox.addEventListener('change', updateDisabledState);
}

function initializeOutputs() {
  initializeSecondsInputOutputListeners('rewind');
  initializeSecondsInputOutputListeners('forward');
  initializeSecondsInputOutputListeners('rewind-secondary');
  initializeSecondsInputOutputListeners('forward-secondary');
}

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('form.container')?.addEventListener('submit', submit);
  document
    .querySelector('button#reset-values')
    ?.addEventListener('click', resetToDefaultOptions);
  await loadInputStorageOptions();
  initializeOutputs();
  initializeSecondaryEnable();
});
