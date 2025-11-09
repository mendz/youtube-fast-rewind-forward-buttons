import { ButtonClassesIds } from './types';

type StylableElement = HTMLButtonElement | SVGElement;

export function isNewUiPlayer(): boolean {
  return document.querySelector('.ytp-delhi-modern') !== null;
}

const SPACING_PROPERTIES = [
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'margin-block',
  'margin-block-start',
  'margin-block-end',
  'margin-inline',
  'margin-inline-start',
  'margin-inline-end',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'padding-block',
  'padding-block-start',
  'padding-block-end',
  'padding-inline',
  'padding-inline-start',
  'padding-inline-end',
] as const;

const BUTTON_STYLE_PROPERTIES = [
  'width',
  'height',
  ...SPACING_PROPERTIES,
] as const;

const SVG_STYLE_PROPERTIES = [
  'width',
  'height',
  'box-sizing',
  ...SPACING_PROPERTIES,
] as const;

const CUSTOM_BUTTON_SELECTOR = `button.${ButtonClassesIds.CLASS}`;

let playButtonResizeObserver: ResizeObserver | null = null;
let playButtonMutationObserver: MutationObserver | null = null;
let playButtonContainerObserver: MutationObserver | null = null;
let observedPlayButtonContainer: Element | null = null;
let hasBoundPageExitCleanup = false;

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

function cleanupPlayButtonObserver(): void {
  if (playButtonResizeObserver) {
    playButtonResizeObserver.disconnect();
    playButtonResizeObserver = null;
  }

  if (playButtonMutationObserver) {
    playButtonMutationObserver.disconnect();
    playButtonMutationObserver = null;
  }

  if (playButtonContainerObserver) {
    playButtonContainerObserver.disconnect();
    playButtonContainerObserver = null;
  }

  observedPlayButtonContainer = null;
}

function handlePageExit(): void {
  cleanupPlayButtonObserver();
}

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

function tryResyncCustomButtonsStyles(): void {
  const hasObserver = ensurePlayButtonObserver();
  if (!hasObserver) {
    scheduleNextAttempt();
    return;
  }
  resyncCustomButtonsStyles();
}

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

function scheduleResyncCustomButtons(): void {
  if (!isNewUiPlayer()) {
    return;
  }

  tryResyncCustomButtonsStyles();
}

function syncWithYouTubeButtonStyles(button: HTMLButtonElement): void {
  if (!isNewUiPlayer()) {
    return;
  }

  const referenceButton = document.querySelector(
    '.ytp-play-button'
  ) as HTMLButtonElement | null;

  if (!referenceButton) {
    return;
  }

  const referenceButtonStyles = getComputedStyle(referenceButton);
  applyStyleProperties(button, referenceButtonStyles, BUTTON_STYLE_PROPERTIES);
  const referenceSvg = referenceButton.querySelector('svg');
  const targetSvg = button.querySelector('svg');

  if (!referenceSvg || !targetSvg) {
    return;
  }

  const referenceSvgStyles = getComputedStyle(referenceSvg);
  applyStyleProperties(targetSvg, referenceSvgStyles, SVG_STYLE_PROPERTIES);
}

function ensurePlayButtonObserver(): boolean {
  if (!isNewUiPlayer()) {
    cleanupPlayButtonObserver();
    return false;
  }

  const playButton = document.querySelector(
    '.ytp-play-button'
  ) as HTMLButtonElement | null;

  if (!playButton) {
    cleanupPlayButtonObserver();
    return false;
  }

  if (!observedPlayButtonContainer?.isConnected) {
    cleanupPlayButtonObserver();
  }

  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    if (!playButtonResizeObserver) {
      playButtonResizeObserver = new window.ResizeObserver(() => {
        resyncCustomButtonsStyles();
      });
    } else {
      playButtonResizeObserver.disconnect();
    }
    playButtonResizeObserver.observe(playButton);
  }

  if (!playButtonMutationObserver) {
    playButtonMutationObserver = new MutationObserver(() => {
      resyncCustomButtonsStyles();
    });
  } else {
    playButtonMutationObserver.disconnect();
  }

  playButtonMutationObserver.observe(playButton, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  const playButtonContainer = playButton.parentElement;

  if (playButtonContainer) {
    if (!playButtonContainerObserver) {
      playButtonContainerObserver = new MutationObserver(() => {
        ensurePlayButtonObserver();
        resyncCustomButtonsStyles();
      });
    } else {
      playButtonContainerObserver.disconnect();
    }

    playButtonContainerObserver.observe(playButtonContainer, {
      childList: true,
      subtree: true,
    });

    observedPlayButtonContainer = playButtonContainer;
  }

  bindPageExitCleanup();
  return true;
}

export function teardownNativeButtonSyncIfUnused(): void {
  const hasCustomButtons =
    document.querySelector(CUSTOM_BUTTON_SELECTOR) !== null;

  if (hasCustomButtons) {
    return;
  }

  cleanupPlayButtonObserver();
}

export function setupCustomButtonsStylesSync(button: HTMLButtonElement): void {
  if (!isNewUiPlayer()) {
    return;
  }

  syncWithYouTubeButtonStyles(button);
  ensurePlayButtonObserver();
  scheduleResyncCustomButtons();
}
