import { getButtons, updateButtonsTitles } from './buttons';
import { overrideArrowKeys } from './event-keys';
import { ButtonClassesIds } from './types';

let loadedOptions: IOptions;
/**
 * Load the extension options from the storage
 * If the option doesn't exists it will return its default values
 * ```
  const defaultOptions: Readonly<IOptions> = {
    rewindSeconds: 5,
    forwardSeconds: 5,
    shouldOverrideKeys: false,
  };
 * ```
 * @returns 
 */
export async function loadOptions(): Promise<IOptions> {
  const defaultOptions: Readonly<IOptions> = {
    rewindSeconds: 5,
    forwardSeconds: 5,
    shouldOverrideKeys: false,
  };

  try {
    const storageOptions: IStorageOptions = (await chrome.storage.sync.get(
      Object.keys(defaultOptions)
    )) as IStorageOptions;

    const rewindSeconds: number = parseInt(storageOptions?.rewindSeconds, 10);
    const forwardSeconds: number = parseInt(storageOptions?.forwardSeconds, 10);

    return {
      rewindSeconds: !Number.isNaN(rewindSeconds)
        ? rewindSeconds
        : defaultOptions.rewindSeconds,
      forwardSeconds: !Number.isNaN(forwardSeconds)
        ? forwardSeconds
        : defaultOptions.forwardSeconds,
      shouldOverrideKeys:
        storageOptions?.shouldOverrideKeys ?? defaultOptions.shouldOverrideKeys,
    };
  } catch (error) {
    console.error(error);
    return defaultOptions;
  }
}

export function updateButtonAfterNewStorage(
  newChangesOptions: { [key: string]: chrome.storage.StorageChange },
  currentOptions: IOptions
): IOptions {
  let changeForwardSeconds: Nullable<number> = parseInt(
    newChangesOptions['forwardSeconds']?.newValue,
    10
  );
  let changeRewindSeconds: Nullable<number> = parseInt(
    newChangesOptions['rewindSeconds']?.newValue,
    10
  );

  if (isNaN(changeForwardSeconds)) {
    changeForwardSeconds = null;
  }
  if (isNaN(changeRewindSeconds)) {
    changeRewindSeconds = null;
  }

  const newOptions: IOptions = {
    forwardSeconds: changeForwardSeconds ?? currentOptions.forwardSeconds,
    rewindSeconds: changeRewindSeconds ?? currentOptions.rewindSeconds,
    shouldOverrideKeys:
      newChangesOptions['shouldOverrideKeys']?.newValue ??
      currentOptions.shouldOverrideKeys,
  };
  updateButtonsTitles(newOptions);
  return { ...newOptions };
}

chrome.storage.onChanged.addListener(
  (changes: { [key: string]: chrome.storage.StorageChange }): void => {
    loadedOptions = updateButtonAfterNewStorage(changes, loadedOptions);
  }
);

export async function run(): Promise<void> {
  const options: IOptions = await loadOptions();
  loadedOptions = { ...options };
  const video: Nullable<HTMLVideoElement> = document.querySelector('video');
  const customButton: HTMLButtonElement | null = document.querySelector(
    `button.${ButtonClassesIds.CLASS}`
  );

  // check if there is no custom button already
  if (video?.src && !customButton) {
    const playerNextButton: Nullable<HTMLButtonElement> =
      document.querySelector('div.ytp-left-controls a.ytp-next-button');

    if (!playerNextButton) {
      console.error('No playerNextButton');
      return;
    }

    // copy all svg values from the player button
    const svgClasses: string[] = [
      ...(playerNextButton.querySelector('svg')?.classList ?? []),
    ];
    const svgPathClasses: string[] = [
      ...(playerNextButton.querySelector('svg path')?.classList ?? []),
    ];
    const svgUseHtml: string =
      playerNextButton.querySelector('svg use')?.outerHTML ?? '';

    const { fastRewindButton, fastForwardButton } = getButtons(
      loadedOptions,
      video,
      {
        svgClasses,
        svgPathClasses,
        svgUseHtml,
      }
    );

    // add the buttons to the player
    playerNextButton.insertAdjacentElement('afterend', fastForwardButton);
    playerNextButton.insertAdjacentElement('afterend', fastRewindButton);
    document.addEventListener(
      'keydown',
      (event) => overrideArrowKeys(event, loadedOptions, video),
      { capture: true }
    );
  }
}

run();
