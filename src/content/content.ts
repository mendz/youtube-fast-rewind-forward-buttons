enum ArrowKey {
  ARROW_LEFT_KEY = 'ArrowLeft',
  ARROW_RIGHT_KEY = 'ArrowRight',
}

type CreateButtonArg = {
  svg: string;
  title: string;
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

const KEY_CODES: { [key in ArrowKey]: number } = {
  [ArrowKey.ARROW_LEFT_KEY]: 37,
  [ArrowKey.ARROW_RIGHT_KEY]: 39,
};

const ALL_KEY_CODES: ArrowKey[] = [
  ArrowKey.ARROW_LEFT_KEY,
  ArrowKey.ARROW_RIGHT_KEY,
];

const BUTTON_CLASS = `ml-custom-rewind-forward-buttons`;

function createButton({ svg, title }: CreateButtonArg): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.classList.add('ytp-button');
  button.classList.add(BUTTON_CLASS);
  button.innerHTML = svg;
  button.title = title;
  button.setAttribute('aria-label', title);
  return button;
}

function simulateKey(key: ArrowKey): void {
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

function getSeconds(updateType: string, options: IOptions): number {
  switch (updateType) {
    case ArrowKey.ARROW_LEFT_KEY:
      return options.rewindSeconds;
    case ArrowKey.ARROW_RIGHT_KEY:
      return options.forwardSeconds;
    default:
      return 5;
  }
}

// TODO: need to check now without the parseFloat
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
function isShouldSkipOverrideKeys(
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

function getElementsForTooltipCalculation(): {
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
    [...document.querySelectorAll('div#player-container')].find(
      (container: Element): boolean =>
        container.classList.contains('ytd-watch-flexy')
    ) ?? null;
  const firstPlayerContainer: Nullable<Element> = document.querySelector(
    'div#player-container'
  );

  if (!mainPlayerContainer && !firstPlayerContainer) {
    console.error(`Couldn't find player container`);
    return;
  }

  const playerContainerHeight: number =
    mainPlayerContainer?.clientHeight ??
    firstPlayerContainer?.clientHeight ??
    0;
  const bottomControlsHeight: number =
    document.querySelector('div.ytp-chrome-bottom')?.clientHeight ?? 0;
  const buttonHeight: number = this.clientHeight;
  const tooltipTopPosition: number =
    playerContainerHeight - bottomControlsHeight - buttonHeight;

  // change values to show  the tooltip
  tooltipContainer.classList.add('ytp-tooltip');
  tooltipContainer.classList.add('ytp-bottom');
  tooltipContainer.classList.remove('ytp-preview');
  tooltipContainer.classList.remove('ytp-text-detail');
  tooltipContainer.classList.remove('ytp-has-duration');
  tooltipContainer.style.display = 'block';
  tooltipContainer.style.maxWidth = '300px';
  tooltipContainer.style.top = `${tooltipTopPosition}px`;
  tooltipContainer.style.left = `${this.offsetLeft - this.offsetWidth}px`;
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

function getFastRewindSVG(
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

function getFastForwardSVG(
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

  // set buttons title (tooltip)
  const leftArrowTitle: string =
    shouldOverrideKeys || rewindSeconds === 5 ? ' (left arrow)' : '';
  const rightArrowTitle: string =
    shouldOverrideKeys || forwardSeconds === 5 ? ' (right arrow)' : '';

  // set the buttons
  const fastRewindButton: HTMLButtonElement = createButton({
    svg: getFastRewindSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: `Go back ${rewindSeconds} seconds${leftArrowTitle}`,
  });
  const fastForwardButton: HTMLButtonElement = createButton({
    svg: getFastForwardSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: `Go forward ${forwardSeconds} seconds${rightArrowTitle}`,
  });

  // add events listener
  fastRewindButton.addEventListener('click', () =>
    handleArrowButtons({
      video,
      seconds: options.rewindSeconds,
      updateType: ArrowKey.ARROW_LEFT_KEY,
    })
  );
  fastForwardButton.addEventListener('click', () =>
    handleArrowButtons({
      video,
      seconds: options.forwardSeconds,
      updateType: ArrowKey.ARROW_RIGHT_KEY,
    })
  );
  fastRewindButton.addEventListener('mouseenter', handleTooltipOnMouseOver);
  fastRewindButton.addEventListener('mouseleave', handleTooltipOnMouseLeave);
  fastForwardButton.addEventListener('mouseenter', handleTooltipOnMouseOver);
  fastForwardButton.addEventListener('mouseleave', handleTooltipOnMouseLeave);

  return { fastRewindButton, fastForwardButton };
}

async function run(): Promise<void> {
  const options: IOptions = await loadOptions();
  const video: Nullable<HTMLVideoElement> = document.querySelector('video');
  const customButton: HTMLButtonElement | null = document.querySelector(
    `button.${BUTTON_CLASS}`
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

    const { fastRewindButton, fastForwardButton } = getButtons(options, video, {
      svgClasses,
      svgPathClasses,
      svgUseHtml,
    });

    // add the buttons to the player
    playerNextButton.insertAdjacentElement('afterend', fastForwardButton);
    playerNextButton.insertAdjacentElement('afterend', fastRewindButton);
    document.addEventListener(
      'keydown',
      (event) => overrideArrowKeys(event, options, video),
      { capture: true }
    );
  }
}

run();
