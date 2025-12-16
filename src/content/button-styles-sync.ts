import { ButtonClassesIds } from './types';

type StylableElement = HTMLButtonElement | SVGElement;

const PARENT_PROPERTIES = ['margin'] as const;
const BUTTON_STYLE_PROPERTIES = ['width', 'height'] as const;
const CUSTOM_BUTTON_SELECTOR = `button.${ButtonClassesIds.CLASS}`;

let muteButtonResizeObserver: ResizeObserver | null = null;
let muteButtonMutationObserver: MutationObserver | null = null;
let muteButtonContainerObserver: MutationObserver | null = null;
let observedMuteButtonContainer: Element | null = null;
let hasBoundPageExitCleanup = false;
let resyncQueued = false;

function requestResyncCustomButtonsStyles(): void {
  if (resyncQueued) {
    return;
  }
  resyncQueued = true;

  const run = (): void => {
    resyncQueued = false;
    resyncCustomButtonsStyles();
  };

  if (
    typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function'
  ) {
    window.requestAnimationFrame(run);
    return;
  }

  setTimeout(run, 100);
}

// #region Utility Functions

/**
 * Checks if YouTube is using the new UI player.
 * @returns {boolean} True if the new UI player is detected, false otherwise.
 */
export function isNewUiPlayer(): boolean {
  return document.querySelector('.ytp-delhi-modern') !== null;
}

/**
 * Applies style properties from a source element's computed styles to a target element.
 * @param {StylableElement} target - The element to apply styles to.
 * @param {CSSStyleDeclaration} sourceStyles - The computed styles to copy from.
 * @param {readonly string[]} properties - Array of CSS property names to copy.
 */
function applyStyleProperties(
  target: StylableElement,
  sourceStyles: CSSStyleDeclaration,
  properties: readonly string[]
): void {
  properties.forEach((property) => {
    const value = sourceStyles.getPropertyValue(property);
    if (!value) return;
    target.style.setProperty(property, value);
  });
}

// #endregion

// #region Cleanup Functions

/**
 * Cleans up all mute button observers (ResizeObserver, MutationObserver, and container observer).
 * Disconnects observers and resets module-level state.
 */
function cleanupMuteButtonObserver(): void {
  if (muteButtonResizeObserver) {
    muteButtonResizeObserver.disconnect();
    muteButtonResizeObserver = null;
  }

  if (muteButtonMutationObserver) {
    muteButtonMutationObserver.disconnect();
    muteButtonMutationObserver = null;
  }

  if (muteButtonContainerObserver) {
    muteButtonContainerObserver.disconnect();
    muteButtonContainerObserver = null;
  }

  observedMuteButtonContainer = null;
  resyncQueued = false;
}

/**
 * Handles page exit events by cleaning up observers.
 * Called when the page is being unloaded or hidden.
 */
function handlePageExit(): void {
  cleanupMuteButtonObserver();
}

/**
 * Binds page exit cleanup handlers to window events.
 * Ensures observers are cleaned up when the page is unloaded.
 * Only binds once per page lifecycle.
 */
function bindPageExitCleanup(): void {
  if (hasBoundPageExitCleanup) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener('pagehide', handlePageExit);
  window.addEventListener('beforeunload', handlePageExit);
  hasBoundPageExitCleanup = true;
}

// #endregion

// #region Core Sync Functions

/**
 * Syncs a single custom button's styles with YouTube's native button styles.
 * Copies width, height, and margin properties from the reference mute button.
 * @param {HTMLButtonElement} button - The custom button to sync styles for.
 */
function syncWithYouTubeButtonStyles(button: HTMLButtonElement): void {
  if (!isNewUiPlayer()) {
    return;
  }

  const referenceButton = document.querySelector(
    '.ytp-left-controls .ytp-mute-button'
  ) as HTMLButtonElement | null;

  if (!referenceButton) {
    console.warn('No reference button found');
    return;
  }

  const referenceButtonStyles = getComputedStyle(referenceButton);
  applyStyleProperties(button, referenceButtonStyles, BUTTON_STYLE_PROPERTIES);

  // Copy margin from parent .ytp-volume-area to override button's margin
  const volumeArea = referenceButton.closest(
    '.ytp-volume-area'
  ) as HTMLElement | null;

  if (!volumeArea) {
    console.warn('No volume area found');
    return;
  }

  const volumeAreaStyles = getComputedStyle(volumeArea);
  applyStyleProperties(button, volumeAreaStyles, [...PARENT_PROPERTIES]);
}

/**
 * Resyncs styles for all custom buttons found in the document.
 * Only works with the new UI player.
 */
function resyncCustomButtonsStyles(): void {
  if (!isNewUiPlayer()) {
    return;
  }

  const buttons = document.querySelectorAll<HTMLButtonElement>(
    CUSTOM_BUTTON_SELECTOR
  );

  buttons.forEach((customButton) => {
    syncWithYouTubeButtonStyles(customButton);
  });
}

// #endregion

// #region Observer Setup

/**
 * Ensures that observers are set up for the play button to detect style changes.
 * Sets up ResizeObserver and MutationObserver on the mute button, and a MutationObserver
 * on its container. Also binds page exit cleanup handlers.
 * @returns {boolean} True if observers were successfully set up, false otherwise.
 */
function ensureMuteButtonObserver(): boolean {
  if (!isNewUiPlayer()) {
    cleanupMuteButtonObserver();
    return false;
  }

  const muteButton = document.querySelector(
    '.ytp-mute-button'
  ) as HTMLButtonElement | null;

  if (!muteButton) {
    cleanupMuteButtonObserver();
    return false;
  }

  if (!observedMuteButtonContainer?.isConnected) {
    cleanupMuteButtonObserver();
  }

  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    if (!muteButtonResizeObserver) {
      muteButtonResizeObserver = new window.ResizeObserver(() => {
        requestResyncCustomButtonsStyles();
      });
    } else {
      muteButtonResizeObserver.disconnect();
    }
    muteButtonResizeObserver.observe(muteButton);
  }

  if (!muteButtonMutationObserver) {
    muteButtonMutationObserver = new MutationObserver(() => {
      requestResyncCustomButtonsStyles();
    });
  } else {
    muteButtonMutationObserver.disconnect();
  }

  muteButtonMutationObserver.observe(muteButton, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  const muteButtonContainer = muteButton.parentElement;

  if (muteButtonContainer) {
    if (!muteButtonContainerObserver) {
      muteButtonContainerObserver = new MutationObserver(() => {
        ensureMuteButtonObserver();
        requestResyncCustomButtonsStyles();
      });
    } else {
      muteButtonContainerObserver.disconnect();
    }

    muteButtonContainerObserver.observe(muteButtonContainer, {
      childList: true,
      subtree: true,
    });

    observedMuteButtonContainer = muteButtonContainer;
  }

  bindPageExitCleanup();
  return true;
}

// #endregion

// #region Retry Logic

/**
 * Schedules the next attempt to resync custom button styles.
 * Uses requestAnimationFrame if available, otherwise falls back to setTimeout.
 */
function scheduleNextAttempt(): void {
  if (
    typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function'
  ) {
    window.requestAnimationFrame(tryResyncCustomButtonsStyles);
  } else {
    setTimeout(tryResyncCustomButtonsStyles, 100);
  }
}

/**
 * Attempts to resync custom button styles, with retry logic if observers aren't ready.
 * If observers can't be set up, schedules another attempt.
 */
function tryResyncCustomButtonsStyles(): void {
  const hasObserver = ensureMuteButtonObserver();
  if (!hasObserver) {
    scheduleNextAttempt();
    return;
  }
  requestResyncCustomButtonsStyles();
}

// #endregion

// #region Entry Points

/**
 * Sets up style synchronization for a custom button.
 * Syncs the button's styles immediately and ensures observers are in place
 * to keep styles in sync as YouTube's UI changes.
 * @param {HTMLButtonElement} button - The custom button to set up style sync for.
 */
export function setupCustomButtonsStylesSync(button: HTMLButtonElement): void {
  if (!isNewUiPlayer()) {
    return;
  }

  syncWithYouTubeButtonStyles(button);
  ensureMuteButtonObserver();
  tryResyncCustomButtonsStyles();
}

/**
 * Tears down native button sync observers if no custom buttons are present.
 * Cleans up observers when all custom buttons have been removed from the page.
 */
export function teardownNativeButtonSyncIfUnused(): void {
  const hasCustomButtons =
    document.querySelector(CUSTOM_BUTTON_SELECTOR) !== null;

  if (hasCustomButtons) {
    return;
  }

  cleanupMuteButtonObserver();
}

// #endregion
