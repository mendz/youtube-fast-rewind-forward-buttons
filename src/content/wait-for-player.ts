import { YouTubeSelectors } from './selectors';

// #region Types

export interface PlayerElements {
  video: HTMLVideoElement;
  controls: Element;
  anchorButton: HTMLButtonElement;
}

export interface WaitOptions {
  /** Maximum number of retry attempts. Default: 600 (~10s at 60fps) */
  maxRetries?: number;
  /** Optional callback invoked on each retry attempt */
  onRetry?: () => void;
}

// #endregion

// #region Constants

const DEFAULT_MAX_RETRIES = 600; // ~10 seconds at 60fps
const FALLBACK_INTERVAL_MS = 16; // ~60fps fallback for environments without RAF

// #endregion

// #region Module State

let waitAborted = false;
let hasBoundCleanup = false;

// #endregion

// #region Core Functions

/**
 * Queries the DOM for required YouTube player elements.
 * Returns null if any required element is missing or video has no src.
 */
function queryPlayerElements(): PlayerElements | null {
  const video = document.querySelector<HTMLVideoElement>(
    `${YouTubeSelectors.Player.CONTAINER_ELEMENT} ${YouTubeSelectors.Player.VIDEO}, ` +
      `${YouTubeSelectors.Player.CONTAINER_CLASS} ${YouTubeSelectors.Player.VIDEO}`
  );

  if (!video?.src) {
    return null;
  }

  const controls = document.querySelector(
    YouTubeSelectors.Player.CONTROLS_LEFT
  );

  if (!controls) {
    return null;
  }

  const nextButton = controls.querySelector<HTMLButtonElement>(
    YouTubeSelectors.Player.NEXT_BUTTON
  );
  const playButton = controls.querySelector<HTMLButtonElement>(
    YouTubeSelectors.Player.PLAY_BUTTON
  );

  const anchorButton = nextButton ?? playButton;
  if (!anchorButton) {
    return null;
  }

  return { video, controls, anchorButton };
}

/**
 * Schedules the next check using requestAnimationFrame or setTimeout fallback.
 */
function scheduleNextCheck(callback: () => void): void {
  if (
    typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function'
  ) {
    window.requestAnimationFrame(callback);
    return;
  }

  setTimeout(callback, FALLBACK_INTERVAL_MS);
}

/**
 * Waits for YouTube player elements to be available in the DOM.
 * Uses requestAnimationFrame for efficient polling with retry limits.
 *
 * @param options - Configuration options for waiting behavior
 * @returns Promise resolving to PlayerElements if found, null if max retries reached or aborted
 *
 * @example
 * ```typescript
 * const elements = await waitForPlayerElements();
 * if (elements) {
 *   addButtonsToVideo(options, elements.video);
 * }
 * ```
 */
export function waitForPlayerElements(
  options?: WaitOptions
): Promise<PlayerElements | null> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  let attempts = 0;
  waitAborted = false;

  return new Promise((resolve) => {
    const checkElements = (): void => {
      if (waitAborted) {
        resolve(null);
        return;
      }

      const result = queryPlayerElements();

      if (result) {
        resolve(result);
        return;
      }

      attempts++;
      if (attempts >= maxRetries) {
        console.warn('Max retries reached waiting for player elements');
        resolve(null);
        return;
      }

      options?.onRetry?.();
      scheduleNextCheck(checkElements);
    };

    checkElements();
  });
}

// #endregion

// #region Cleanup Functions

/**
 * Aborts any pending wait operation.
 * Should be called on page unload to prevent memory leaks.
 */
export function abortWait(): void {
  waitAborted = true;
}

/**
 * Binds page exit cleanup handlers to abort pending waits.
 * Only binds once per page lifecycle.
 */
export function bindWaitCleanup(): void {
  if (hasBoundCleanup) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener('pagehide', abortWait);
  window.addEventListener('beforeunload', abortWait);
  hasBoundCleanup = true;
}

/**
 * Resets module state. Exposed for testing purposes.
 */
export function resetWaitState(): void {
  waitAborted = false;
  hasBoundCleanup = false;
}

// #endregion
