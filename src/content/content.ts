export enum ArrowKey {
  ARROW_LEFT_KEY = 'ArrowLeft',
  ARROW_RIGHT_KEY = 'ArrowRight',
}

type CreateButtonArg = {
  svg: string;
  title: string;
  id?: string;
};

type VideoTimeArg = {
  seconds: number;
  video: HTMLVideoElement;
  updateType: ArrowKey;
};

type ButtonExtraStylesArg = {
  svgClasses: string[];
  svgPathClasses: string[];
  svgUseHtml: string;
};

export const KEY_CODES: { [key in ArrowKey]: number } = {
  [ArrowKey.ARROW_LEFT_KEY]: 37,
  [ArrowKey.ARROW_RIGHT_KEY]: 39,
};

const ALL_KEY_CODES: ArrowKey[] = [
  ArrowKey.ARROW_LEFT_KEY,
  ArrowKey.ARROW_RIGHT_KEY,
];

export enum ButtonClassesIds {
  CLASS = `ml-custom-rewind-forward-buttons`,
  REWIND_ID = 'ml-custom-rewind-button',
  FORWARD_ID = 'ml-custom-forward-button',
}

let loadedOptions: IOptions;

export function createButton({
  svg,
  title,
  id,
}: CreateButtonArg): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.classList.add('ytp-button');
  button.classList.add(ButtonClassesIds.CLASS);
  button.innerHTML = svg;
  button.title = title;
  button.setAttribute('aria-label', title);
  if (id) {
    button.id = id;
  }
  return button;
}

export function simulateKey(key: ArrowKey): void {
  const event: KeyboardEvent = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: KEY_CODES[key],
    which: KEY_CODES[key],
  } as KeyboardEventInit);
  const body: HTMLBodyElement | null = document.querySelector('body');
  if (body) {
    body.dispatchEvent(event);
  } else {
    console.error(`simulateKey failed, couldn't find body`);
  }
}

export function getSeconds(updateType: string, options: IOptions): number {
  switch (updateType) {
    case ArrowKey.ARROW_LEFT_KEY:
      return options.rewindSeconds;
    case ArrowKey.ARROW_RIGHT_KEY:
      return options.forwardSeconds;
    default:
      return 5;
  }
}

function updateVideoTime({ seconds, video, updateType }: VideoTimeArg): void {
  if (updateType === ArrowKey.ARROW_LEFT_KEY) {
    video.currentTime -= seconds;
  } else if (updateType === ArrowKey.ARROW_RIGHT_KEY) {
    video.currentTime += seconds;
  }
}

function handleArrowButtons({
  seconds,
  video,
  updateType,
}: VideoTimeArg): void {
  if (seconds === 5) {
    simulateKey(updateType);
  } else {
    updateVideoTime({ seconds, video, updateType });
  }
}

/**
 * Checks:
 * * The event key is part of the ArrowLeft / ArrowRight keys
 * * For the correct event key if its 5 seconds or not
 * @returns boolean if should skip
 */
export function isShouldSkipOverrideKeys(
  eventKey: ArrowKey,
  options: IOptions
): boolean {
  return (
    !ALL_KEY_CODES.includes(eventKey) ||
    !options.shouldOverrideKeys ||
    (eventKey === ArrowKey.ARROW_LEFT_KEY && options.rewindSeconds === 5) ||
    (eventKey === ArrowKey.ARROW_RIGHT_KEY && options.forwardSeconds === 5)
  );
}

function overrideArrowKeys(
  event: KeyboardEvent,
  options: IOptions,
  video: HTMLVideoElement
): void {
  if (isShouldSkipOverrideKeys(event.key as ArrowKey, options)) {
    return;
  }
  event.preventDefault();
  updateVideoTime({
    seconds: getSeconds(event.key, options),
    video,
    updateType: event.key as ArrowKey,
  });
}

export function getElementsForTooltipCalculation(): {
  tooltipContainer: HTMLElement;
  tooltipTextSpan: HTMLSpanElement;
} {
  const textWrapper: Nullable<Element> = document.querySelector(
    'div.ytp-tooltip-text-wrapper'
  );

  if (!textWrapper) {
    throw new Error(`Couldn't find tooltip elements!`);
  }

  const tooltipContainer: Nullable<HTMLElement> = textWrapper.parentElement;
  const tooltipTextSpan: Nullable<HTMLSpanElement> = textWrapper.querySelector(
    'span.ytp-tooltip-text'
  );

  if (!tooltipContainer || !tooltipTextSpan) {
    throw new Error(`Couldn't find tooltip elements!`);
  }

  return {
    tooltipContainer,
    tooltipTextSpan,
  };
}

/**
 * Handle mouse over button events for showing the tooltip
 */
function handleTooltipOnMouseOver(this: HTMLButtonElement): void {
  const { tooltipContainer, tooltipTextSpan: textSpan } =
    getElementsForTooltipCalculation();

  // elements height for calculate the top of the button
  const mainPlayerContainer: Nullable<Element> =
    document.querySelector('ytd-player');

  if (!mainPlayerContainer) {
    console.error(`Couldn't find player container`);
    return;
  }

  const playerContainerHeight: number = mainPlayerContainer.clientHeight;
  const bottomControlsHeight: number =
    document.querySelector('div.ytp-chrome-bottom')?.clientHeight ?? 0;
  const buttonHeight: number = this.clientHeight;
  const tooltipTopPosition: number =
    playerContainerHeight - bottomControlsHeight - buttonHeight + 12;

  // change values to show  the tooltip
  tooltipContainer.classList.add('ytp-tooltip');
  tooltipContainer.classList.add('ytp-bottom');
  tooltipContainer.classList.remove('ytp-preview');
  tooltipContainer.classList.remove('ytp-text-detail');
  tooltipContainer.classList.remove('ytp-has-duration');
  tooltipContainer.style.maxWidth = '300px';
  tooltipContainer.style.top = `${tooltipTopPosition}px`;
  tooltipContainer.style.left = `${this.offsetLeft - this.offsetWidth}px`;
  tooltipContainer.style.display = 'block';
  tooltipContainer.setAttribute('aria-hidden', 'false');
  textSpan.innerHTML = this.title;

  // remove title from the button
  this.title = '';
}

/**
 * Handle mouse leave button events for showing the tooltip
 */
function handleTooltipOnMouseLeave(this: HTMLButtonElement): void {
  const { tooltipContainer, tooltipTextSpan: textSpan } =
    getElementsForTooltipCalculation();

  const title: string = textSpan.innerText;

  // change values to hide the tooltip
  tooltipContainer.style.display = 'none';
  tooltipContainer.setAttribute('aria-hidden', 'true');
  tooltipContainer.classList.remove('ytp-bottom');
  this.title = title;
}

async function loadOptions(): Promise<IOptions> {
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

export function getFastRewindSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
  <svg class="${svgClasses}" height="100%" width="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    ${svgUseHtml.replace(
      /xlink:href="#.*"/,
      'xlink:href="#custom-path-rewind"'
    )}
    <path class="${svgPathClasses}" id="custom-path-rewind" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
  </svg>
`;
}

export function getFastForwardSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
  <svg class="${svgClasses}" height="100%" width="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  ${svgUseHtml.replace(
    /xlink:href="#.*"/,
    'xlink:href="#custom-path-fast-forward"'
  )}
    <path class="${svgPathClasses}" id="custom-path-fast-forward" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
  </svg>
`;
}

export function getRewindButtonTitle(
  seconds: number,
  shouldOverrideKeys: boolean
): string {
  const title: string =
    shouldOverrideKeys || seconds === 5 ? ' (left arrow)' : '';
  return `Go back ${seconds} seconds${title}`;
}

export function getForwardButtonTitle(
  seconds: number,
  shouldOverrideKeys: boolean
): string {
  const title: string =
    shouldOverrideKeys || seconds === 5 ? ' (right arrow)' : '';
  return `Go forward ${seconds} seconds${title}`;
}

function getButtons(
  options: IOptions,
  video: HTMLVideoElement,
  extraStyles: ButtonExtraStylesArg
): {
  fastRewindButton: HTMLButtonElement;
  fastForwardButton: HTMLButtonElement;
} {
  const { shouldOverrideKeys, rewindSeconds, forwardSeconds } = options;
  const { svgClasses, svgUseHtml, svgPathClasses } = extraStyles;

  // set the buttons
  const fastRewindButton: HTMLButtonElement = createButton({
    svg: getFastRewindSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: getRewindButtonTitle(rewindSeconds, shouldOverrideKeys),
    id: ButtonClassesIds.REWIND_ID,
  });
  const fastForwardButton: HTMLButtonElement = createButton({
    svg: getFastForwardSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: getForwardButtonTitle(forwardSeconds, shouldOverrideKeys),
    id: ButtonClassesIds.FORWARD_ID,
  });

  // add events listener
  fastRewindButton.addEventListener('click', () =>
    handleArrowButtons({
      video,
      seconds: loadedOptions.rewindSeconds,
      updateType: ArrowKey.ARROW_LEFT_KEY,
    })
  );
  fastForwardButton.addEventListener('click', () =>
    handleArrowButtons({
      video,
      seconds: loadedOptions.forwardSeconds,
      updateType: ArrowKey.ARROW_RIGHT_KEY,
    })
  );
  fastRewindButton.addEventListener('mouseenter', handleTooltipOnMouseOver);
  fastRewindButton.addEventListener('mouseleave', handleTooltipOnMouseLeave);
  fastForwardButton.addEventListener('mouseenter', handleTooltipOnMouseOver);
  fastForwardButton.addEventListener('mouseleave', handleTooltipOnMouseLeave);

  return { fastRewindButton, fastForwardButton };
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
      ...(playerNextButton.querySelector('svg')?.querySelector('path')
        ?.classList ?? []),
    ];
    const svgUseHtml: string =
      playerNextButton.querySelector('svg')?.querySelector('use')?.outerHTML ??
      '';

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

function updateButtons(newOptions: IOptions): void {
  const { forwardSeconds, rewindSeconds, shouldOverrideKeys } = newOptions;
  // set the buttons titles
  const rewindButton = document.querySelector(
    `button#${ButtonClassesIds.REWIND_ID}`
  ) as HTMLButtonElement;
  const forwardButton = document.querySelector(
    `button#${ButtonClassesIds.FORWARD_ID}`
  ) as HTMLButtonElement;

  rewindButton.title = getRewindButtonTitle(rewindSeconds, shouldOverrideKeys);
  forwardButton.title = getForwardButtonTitle(
    forwardSeconds,
    shouldOverrideKeys
  );
}

chrome.storage.onChanged.addListener(
  (changes: { [key: string]: chrome.storage.StorageChange }): void => {
    const changeForwardSeconds: Nullable<number> = changes['forwardSeconds']
      ?.newValue
      ? parseInt(changes['forwardSeconds'].newValue, 10)
      : null;
    const changeRewindSeconds: Nullable<number> = changes['rewindSeconds']
      ?.newValue
      ? parseInt(changes['rewindSeconds'].newValue, 10)
      : null;

    const newOptions: IOptions = {
      forwardSeconds: changeForwardSeconds ?? loadedOptions.forwardSeconds,
      rewindSeconds: changeRewindSeconds ?? loadedOptions.rewindSeconds,
      shouldOverrideKeys:
        changes['shouldOverrideKeys']?.newValue ??
        loadedOptions.shouldOverrideKeys,
    };
    loadedOptions = { ...newOptions };
    updateButtons(newOptions);
  }
);

run();
