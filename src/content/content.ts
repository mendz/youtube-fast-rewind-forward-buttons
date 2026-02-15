import { addButtonsToVideo, updateButtons } from './buttons';
import {
  overrideArrowKeys,
  overrideMediaKeys,
  shouldSkipDueToFocus,
} from './event-keys';
import {
  ButtonClassesIds,
  ChromeStorageChanges,
  IOptions,
  IStorageOptions,
} from './types';
import { YouTubeSelectors } from './selectors';
import {
  waitForPlayerElements,
  bindWaitCleanup,
  abortWait,
} from './wait-for-player';

// #region SPA Navigation State

let isInitPending = false;
let navFallbackTimer: number | null = null;
let fallbackObserver: MutationObserver | null = null;
let videoSrcObserver: MutationObserver | null = null;
let srcDebounceTimer: number | null = null;
let hasBoundNavListeners = false;

// #endregion

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

let loadedOptions: IOptions | undefined;
let activeVideo: HTMLVideoElement | null = null;
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
    secondarySeconds: {
      checkboxIsEnabled: false,
      forwardSeconds: 5,
      rewindSeconds: 5,
    },
    shouldOverrideKeys: false, // todo: removed in the next version
    shouldOverrideArrowKeys: false,
    shouldOverrideMediaKeys: false,
  };

  try {
    const keys = Object.keys(defaultOptions) as Array<keyof IStorageOptions>;
    const storageOptions = await chrome.storage.sync.get<IStorageOptions>(keys);

    const rewindSeconds: number = parseInt(storageOptions?.rewindSeconds, 10);
    const forwardSeconds: number = parseInt(storageOptions?.forwardSeconds, 10);
    const secondaryRewindSeconds: number = parseInt(
      storageOptions?.secondarySeconds?.rewindSeconds,
      10
    );
    const secondaryForwardSeconds: number = parseInt(
      storageOptions?.secondarySeconds?.forwardSeconds,
      10
    );

    return {
      rewindSeconds: !Number.isNaN(rewindSeconds)
        ? rewindSeconds
        : defaultOptions.rewindSeconds,
      forwardSeconds: !Number.isNaN(forwardSeconds)
        ? forwardSeconds
        : defaultOptions.forwardSeconds,
      secondarySeconds: {
        checkboxIsEnabled:
          storageOptions?.secondarySeconds?.checkboxIsEnabled ??
          defaultOptions.secondarySeconds.checkboxIsEnabled,
        rewindSeconds: !Number.isNaN(secondaryRewindSeconds)
          ? secondaryRewindSeconds
          : defaultOptions.secondarySeconds.rewindSeconds,
        forwardSeconds: !Number.isNaN(secondaryForwardSeconds)
          ? secondaryForwardSeconds
          : defaultOptions.secondarySeconds.forwardSeconds,
      },
      shouldOverrideArrowKeys: handleOverrideKeysMigration(
        defaultOptions,
        storageOptions
      ),
      shouldOverrideMediaKeys:
        storageOptions?.shouldOverrideMediaKeys ??
        defaultOptions.shouldOverrideMediaKeys,
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
    newChangesOptions.forwardSeconds?.newValue as string,
    10
  );
  let changeRewindSeconds: Nullable<number> = parseInt(
    newChangesOptions.rewindSeconds?.newValue as string,
    10
  );
  let changeSecondaryForwardSeconds: Nullable<number> = parseInt(
    (
      newChangesOptions.secondarySeconds
        ?.newValue as IStorageOptions['secondarySeconds']
    )?.forwardSeconds,
    10
  );
  let changeSecondaryRewindSeconds: Nullable<number> = parseInt(
    (
      newChangesOptions.secondarySeconds
        ?.newValue as IStorageOptions['secondarySeconds']
    )?.rewindSeconds,
    10
  );

  if (isNaN(changeForwardSeconds)) {
    changeForwardSeconds = null;
  }
  if (isNaN(changeRewindSeconds)) {
    changeRewindSeconds = null;
  }
  if (isNaN(changeSecondaryForwardSeconds)) {
    changeSecondaryForwardSeconds = null;
  }
  if (isNaN(changeSecondaryRewindSeconds)) {
    changeSecondaryRewindSeconds = null;
  }

  const newOptions: IOptions = {
    forwardSeconds: changeForwardSeconds ?? currentOptions.forwardSeconds,
    rewindSeconds: changeRewindSeconds ?? currentOptions.rewindSeconds,
    secondarySeconds: {
      checkboxIsEnabled:
        (
          newChangesOptions.secondarySeconds
            ?.newValue as IStorageOptions['secondarySeconds']
        )?.checkboxIsEnabled ??
        currentOptions.secondarySeconds.checkboxIsEnabled,
      forwardSeconds:
        changeSecondaryForwardSeconds ??
        currentOptions.secondarySeconds.forwardSeconds,
      rewindSeconds:
        changeSecondaryRewindSeconds ??
        currentOptions.secondarySeconds.rewindSeconds,
    },
    shouldOverrideArrowKeys:
      (newChangesOptions.shouldOverrideArrowKeys?.newValue as boolean) ??
      currentOptions.shouldOverrideArrowKeys,
    shouldOverrideMediaKeys:
      (newChangesOptions.shouldOverrideMediaKeys?.newValue as boolean) ??
      currentOptions.shouldOverrideMediaKeys,
  };

  return { ...newOptions };
}

/**
 * Checks if video element and custom buttons already exist in the DOM.
 */
function hasVideoAndButtons(): boolean {
  const video = document.querySelector<HTMLVideoElement>(
    YouTubeSelectors.Player.VIDEO
  );
  const customButton = document.querySelector(
    `button.${ButtonClassesIds.CLASS}`
  );
  return !!(video?.src && customButton);
}

/**
 * Checks if the YouTube player is ready for button injection.
 * Unlike hasVideoAndButtons(), this does NOT require custom buttons to already
 * exist — it only checks the prerequisites that run() needs to succeed.
 */
function isPlayerReady(): boolean {
  const video = document.querySelector<HTMLVideoElement>(
    YouTubeSelectors.Player.VIDEO
  );
  if (!video?.src) {
    return false;
  }
  const controls = document.querySelector(
    YouTubeSelectors.Player.CONTROLS_LEFT
  );
  const nextButton = controls?.querySelector(
    YouTubeSelectors.Player.NEXT_BUTTON
  );
  const playButton = controls?.querySelector(
    YouTubeSelectors.Player.PLAY_BUTTON
  );
  return !!(nextButton || playButton);
}

/**
 * Cleans up fallback observer and timer.
 */
function cleanupFallback(): void {
  if (navFallbackTimer !== null) {
    clearTimeout(navFallbackTimer);
    navFallbackTimer = null;
  }
  if (fallbackObserver) {
    fallbackObserver.disconnect();
    fallbackObserver = null;
  }
}

function cleanupVideoSrcObserver(): void {
  if (srcDebounceTimer !== null) {
    clearTimeout(srcDebounceTimer);
    srcDebounceTimer = null;
  }
  if (videoSrcObserver) {
    videoSrcObserver.disconnect();
    videoSrcObserver = null;
  }
}

/**
 * Initializes the extension by waiting for player elements and adding buttons.
 * Uses efficient RAF-based polling instead of setInterval.
 */
async function initializeExtension(): Promise<void> {
  // Bind cleanup handlers for page unload
  bindWaitCleanup();
  bindNavCleanup();

  // First immediate attempt
  await exportFunctions.run();

  // Check if buttons were already added
  const customButton = document.querySelector(
    `button.${ButtonClassesIds.CLASS}`
  );
  if (customButton) {
    exportFunctions.observeVideoSrcChange();
    return;
  }

  // Wait for player elements if not ready yet
  const elements = await waitForPlayerElements();
  if (elements) {
    await exportFunctions.run();
    exportFunctions.observeVideoSrcChange();
  }
}

function startInitialization(): void {
  if (isInitPending) {
    return;
  }
  isInitPending = true;
  exportFunctions
    .initializeExtension()
    .finally(() => {
      isInitPending = false;
    })
    .catch((error) => {
      console.error(error);
    });
}

/**
 * Handles SPA navigation events from YouTube.
 * Uses a pending guard to prevent double-fires and includes a fallback
 * MutationObserver in case YouTube events don't fire.
 */
function handleSpaNavigation(): void {
  // Full cleanup of previous navigation state
  cleanupFallback();
  cleanupVideoSrcObserver();
  abortWait();
  isInitPending = false;

  // Set up fallback: if video/buttons don't appear after init attempt,
  // start a MutationObserver to detect when they do
  navFallbackTimer = window.setTimeout(() => {
    navFallbackTimer = null;
    if (hasVideoAndButtons()) {
      return;
    }
    // Start a scoped MutationObserver to detect player appearance.
    // Uses isPlayerReady() instead of hasVideoAndButtons() to avoid a
    // circular dependency: buttons only exist after run(), so checking
    // for them here would deadlock the fallback.
    fallbackObserver?.disconnect();
    fallbackObserver = new MutationObserver(() => {
      if (isPlayerReady()) {
        fallbackObserver?.disconnect();
        fallbackObserver = null;
        exportFunctions.run().catch((error) => {
          console.error(error);
        });
        exportFunctions.observeVideoSrcChange();
      }
    });
    const observeTarget =
      document.querySelector(YouTubeSelectors.Player.CONTAINER_ELEMENT) ??
      document.body;
    fallbackObserver.observe(observeTarget, { childList: true, subtree: true });
  }, 2000);
  exportFunctions.startInitialization();
}

/**
 * Binds YouTube SPA navigation event listeners.
 * Only binds once per page lifecycle.
 */
function bindNavListeners(): void {
  if (hasBoundNavListeners) {
    return;
  }
  if (typeof document === 'undefined') {
    return;
  }

  // YouTube fires these events on SPA navigations
  document.addEventListener('yt-navigate-finish', handleSpaNavigation);
  document.addEventListener('yt-page-data-updated', handleSpaNavigation);
  hasBoundNavListeners = true;
}

/**
 * Cleans up navigation-related state on page unload.
 */
function cleanupNavState(): void {
  cleanupFallback();
  cleanupVideoSrcObserver();
  abortWait();
  isInitPending = false;
}

/**
 * Binds cleanup handlers for navigation state.
 * Only binds once per page lifecycle.
 */
let hasBoundNavCleanup = false;
function bindNavCleanup(): void {
  if (hasBoundNavCleanup) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener('pagehide', cleanupNavState);
  window.addEventListener('beforeunload', cleanupNavState);
  hasBoundNavCleanup = true;
}

function observeVideoSrcChange() {
  cleanupVideoSrcObserver();

  const video = document.querySelector<HTMLVideoElement>(
    YouTubeSelectors.Player.VIDEO
  );
  if (!video) {
    return;
  }

  videoSrcObserver = new MutationObserver((mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        if (srcDebounceTimer !== null) {
          clearTimeout(srcDebounceTimer);
        }
        srcDebounceTimer = window.setTimeout(() => {
          srcDebounceTimer = null;
          exportFunctions.run();
        }, 150);
        break; // one debounced call per batch is enough
      }
    }
  });

  videoSrcObserver.observe(video, { attributeFilter: ['src'] });
}

function keyDownHandler(event: KeyboardEvent, video: HTMLVideoElement) {
  if (!loadedOptions) {
    return;
  }
  if (shouldSkipDueToFocus()) {
    return;
  }

  if (['MediaTrackPrevious', 'MediaTrackNext'].includes(event.key)) {
    overrideMediaKeys(event, loadedOptions, video);
    return;
  }

  overrideArrowKeys(event, loadedOptions, video);
}

/**
 * Stable keydown listener using module-level activeVideo reference.
 * This allows proper removal of the listener when re-attaching.
 */
const keydownListener = (event: KeyboardEvent): void => {
  if (!activeVideo || !document.contains(activeVideo)) {
    return;
  }
  keyDownHandler(event, activeVideo);
};

function addEventListeners(video: HTMLVideoElement) {
  activeVideo = video;
  document.removeEventListener('keydown', keydownListener, { capture: true });
  document.addEventListener('keydown', keydownListener, { capture: true });
}

export async function run(): Promise<void> {
  const options: IOptions = await loadOptions();
  loadedOptions = { ...options };
  const video: Nullable<HTMLVideoElement> = document.querySelector(
    YouTubeSelectors.Player.VIDEO
  );
  const customButton: HTMLButtonElement | null = document.querySelector(
    `button.${ButtonClassesIds.CLASS}`
  );
  const playerControls = document.querySelector(
    YouTubeSelectors.Player.CONTROLS_LEFT
  );
  const playerNextButton = playerControls?.querySelector(
    YouTubeSelectors.Player.NEXT_BUTTON
  );
  const playerPlayButton = playerControls?.querySelector(
    YouTubeSelectors.Player.PLAY_BUTTON
  );

  // check if there is no custom button already AND player controls are ready
  if (video?.src && !customButton && (playerNextButton || playerPlayButton)) {
    addButtonsToVideo(loadedOptions, video);
    addEventListeners(video);
  }
}

// handle option update
chrome.storage.onChanged.addListener(
  async (changes: ChromeStorageChanges): Promise<void> => {
    if (!loadedOptions) {
      loadedOptions = await loadOptions();
    } else {
      loadedOptions = mergeOptions(changes, loadedOptions);
    }

    const video = document.querySelector<HTMLVideoElement>(
      YouTubeSelectors.Player.VIDEO
    );
    if (!video) {
      return;
    }
    updateButtons(loadedOptions, video);
  }
);

/**
 * Resets SPA navigation state. Exposed for testing purposes.
 */
function resetNavState(): void {
  cleanupFallback();
  cleanupVideoSrcObserver();
  abortWait();
  isInitPending = false;
  hasBoundNavListeners = false;
  hasBoundNavCleanup = false;
}

/**
 * Clears the loaded options. Exposed for testing purposes only,
 * to simulate the state before the first run() completes.
 */
function clearLoadedOptions(): void {
  loadedOptions = undefined;
}

/**
 * Gets current SPA navigation state. Exposed for testing purposes.
 */
function getNavState(): {
  isInitPending: boolean;
  navFallbackTimer: number | null;
  fallbackObserver: MutationObserver | null;
  srcDebounceTimer: number | null;
  hasBoundNavListeners: boolean;
  hasBoundNavCleanup: boolean;
} {
  return {
    isInitPending,
    navFallbackTimer,
    fallbackObserver,
    srcDebounceTimer,
    hasBoundNavListeners,
    hasBoundNavCleanup,
  };
}

// Export functions for testing - defined before initialization to allow self-reference
const exportFunctions = {
  run,
  observeVideoSrcChange,
  initializeExtension,
  startInitialization,
  handleSpaNavigation,
  // Exposed for testing
  cleanupFallback,
  cleanupNavState,
  hasVideoAndButtons,
  isPlayerReady,
  resetNavState,
  getNavState,
  bindNavListeners,
  clearLoadedOptions,
};

// Initialize the extension and bind SPA navigation listeners
startInitialization();
bindNavListeners();

export default exportFunctions;
