import { addButtonsToVideo, updateButtons } from './buttons';
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
  currentOptions: IOptions,
  video: HTMLVideoElement
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
  updateButtons(newOptions, video);
  return { ...newOptions };
}

chrome.storage.onChanged.addListener(
  (changes: { [key: string]: chrome.storage.StorageChange }): void => {
    const video = document.querySelector('video') as HTMLVideoElement;
    loadedOptions = updateButtonAfterNewStorage(changes, loadedOptions, video);
  }
);

function intervalQueryForVideo() {
  const interval = setInterval(() => {
    const video = document.querySelector('div.ytd-player video');
    if (video) {
      clearInterval(interval);
      run();
      observeVideoSrcChange();
    }
  }, 1000);
}

function observeVideoSrcChange() {
  const video = document.querySelector<HTMLVideoElement>('video');

  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        run();
      }
    }
  });

  if (video) {
    observer.observe(video, { attributeFilter: ['src'] });
  }
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
    document.addEventListener(
      'keydown',
      (event) => overrideArrowKeys(event, loadedOptions, video),
      { capture: true }
    );
  }
}

run();
intervalQueryForVideo();
