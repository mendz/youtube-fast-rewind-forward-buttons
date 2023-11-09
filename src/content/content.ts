import { addButtonsToVideo, updateButtons } from './buttons';
import { overrideArrowKeys, overrideMediaKeys } from './event-keys';
import {
  ButtonClassesIds,
  ChromeStorageChanges,
  IOptions,
  IStorageOptions,
} from './types';

export function handleOverrideKeysMigration(
  defaultOptions: Readonly<IOptions>,
  storageOptions: IStorageOptions
): boolean {
  // check if there is a value on shouldOverrideKeys, if so use it
  // could be undefined if it wasn't set before or false which it ok to use the new value
  if (storageOptions?.shouldOverrideKeys) {
    return (
      storageOptions?.shouldOverrideKeys ?? defaultOptions.shouldOverrideKeys
    );
  }
  return (
    storageOptions?.shouldOverrideArrowKeys ??
    defaultOptions.shouldOverrideArrowKeys
  );
}

let loadedOptions: IOptions;
/**
 * Load the extension options from the storage
 * If the option doesn't exists it will return its default values
 * ```
  const defaultOptions: Readonly<IOptions> = {
    rewindSeconds: 5,
    forwardSeconds: 5,
    shouldOverrideArrowKeys: false,
    shouldOverrideMediaKeys: false,
  };
 * ```
 * @returns
 */
export async function loadOptions(): Promise<IOptions> {
  const defaultOptions: Readonly<IOptions> = {
    rewindSeconds: 5,
    forwardSeconds: 5,
    shouldOverrideKeys: false, // todo: removed in the next version
    shouldOverrideArrowKeys: false,
    shouldOverrideMediaKeys: false,
    shouldShowButtonsTooltip: true,
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
      shouldOverrideArrowKeys: handleOverrideKeysMigration(
        defaultOptions,
        storageOptions
      ),
      shouldOverrideMediaKeys:
        storageOptions?.shouldOverrideMediaKeys ??
        defaultOptions.shouldOverrideMediaKeys,
      shouldShowButtonsTooltip:
        storageOptions?.shouldShowButtonsTooltip ??
        defaultOptions.shouldShowButtonsTooltip,
    };
  } catch (error) {
    console.error(error);
    return defaultOptions;
  }
}

export function mergeOptions(
  newChangesOptions: ChromeStorageChanges,
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
    shouldOverrideArrowKeys:
      newChangesOptions.shouldOverrideArrowKeys?.newValue ??
      currentOptions.shouldOverrideArrowKeys,
    shouldOverrideMediaKeys:
      newChangesOptions.shouldOverrideMediaKeys?.newValue ??
      currentOptions.shouldOverrideMediaKeys,
    shouldShowButtonsTooltip:
      newChangesOptions.shouldShowButtonsTooltip?.newValue ??
      currentOptions.shouldShowButtonsTooltip,
  };

  return { ...newOptions };
}

function intervalQueryForVideo() {
  const interval = setInterval(() => {
    const video = document.querySelector('div.ytd-player video');
    if (video) {
      clearInterval(interval);
      exportFunctions.run();
      exportFunctions.observeVideoSrcChange();
    }
  }, 1000);
}

function observeVideoSrcChange() {
  const video = document.querySelector<HTMLVideoElement>('video');

  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        exportFunctions.run();
      }
    }
  });

  if (video) {
    observer.observe(video, { attributeFilter: ['src'] });
  }
}

function keyDownHandler(event: KeyboardEvent, video: HTMLVideoElement) {
  if (['MediaTrackPrevious', 'MediaTrackNext'].includes(event.key)) {
    overrideMediaKeys(event, loadedOptions, video);
    return;
  }

  overrideArrowKeys(event, loadedOptions, video);
}

function addEventListeners(video: HTMLVideoElement) {
  document.removeEventListener(
    'keydown',
    (event) => keyDownHandler(event, video),
    { capture: true }
  );
  document.addEventListener(
    'keydown',
    (event) => keyDownHandler(event, video),
    { capture: true }
  );
}

export async function run(): Promise<void> {
  const options: IOptions = await loadOptions();
  loadedOptions = { ...options };
  const video: Nullable<HTMLVideoElement> = document.querySelector('video');
  const customButton: HTMLButtonElement | null = document.querySelector(
    `button.${ButtonClassesIds.CLASS}`
  );

  // check if there is no custom button already
  if (video?.src && !customButton) {
    addButtonsToVideo(loadedOptions, video);
    addEventListeners(video);
  }
}

// handle option update
chrome.storage.onChanged.addListener((changes: ChromeStorageChanges): void => {
  const video = document.querySelector('video') as HTMLVideoElement;
  loadedOptions = mergeOptions(changes, loadedOptions);

  updateButtons(loadedOptions, video);
});

run();
intervalQueryForVideo();

const exportFunctions = {
  run,
  observeVideoSrcChange,
  intervalQueryForVideo,
};

export default exportFunctions;
