const ARROW_LEFT_KEY = 'ArrowLeft';
const ARROW_RIGHT_KEY = 'ArrowRight';
const UPDATE_TYPE = {
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
};
const KEY_CODES = {
  [ARROW_LEFT_KEY]: 37,
  [ARROW_RIGHT_KEY]: 39,
};

/**
 * @param {{svg: string, title: string}} param0
 */
function createButton({ svg, title }) {
  const button = document.createElement('button');
  button.classList.add('ytp-button');
  button.classList.add('custom-rewind-forward-buttons');
  button.innerHTML = svg;
  button.title = title;
  button.setAttribute('aria-label', title);
  return button;
}

/**
 * @param {string} key
 */
function simulateKey(key) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: KEY_CODES[key],
    which: KEY_CODES[key],
  });
  const body = document.querySelector('body');
  body.dispatchEvent(event);
}

/**
 * @param {string} updateType
 * @param {{ rewindSeconds: number, forwardSeconds: number, shouldOverrideKeys: boolean, }} options
 * @returns {number} seconds
 */
function getSeconds(updateType, options) {
  switch (updateType) {
    case UPDATE_TYPE.ARROW_LEFT_KEY:
      return options.rewindSeconds;
    case UPDATE_TYPE.ARROW_RIGHT_KEY:
      return options.forwardSeconds;
    default:
      return 5;
  }
}

/* eslint-disable no-param-reassign */
/**
 * handle click events
 * @param {{ seconds: number, video: HTMLVideoElement, updateType: string }} param0
 */
function updateVideoTime({ seconds, video, updateType }) {
  if (updateType === UPDATE_TYPE.ARROW_LEFT_KEY) {
    video.currentTime -= parseFloat(seconds);
  } else if (updateType === UPDATE_TYPE.ARROW_RIGHT_KEY) {
    video.currentTime += parseFloat(seconds);
  }
}
/* eslint-enable no-param-reassign */

function handleArrowButtons({ seconds, video, updateType }) {
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
 * @param {string} eventKey
 * @param {{ rewindSeconds: number, forwardSeconds: number, shouldOverrideKeys: boolean, }} options
 * @returns {boolean} boolean if should skip
 */
function isShouldSkipOverrideKeys(eventKey, options) {
  return (
    ![UPDATE_TYPE.ARROW_LEFT_KEY, UPDATE_TYPE.ARROW_RIGHT_KEY].includes(
      eventKey
    ) ||
    !options.shouldOverrideKeys ||
    (eventKey === UPDATE_TYPE.ARROW_LEFT_KEY && options.rewindSeconds === 5) ||
    (eventKey === UPDATE_TYPE.ARROW_RIGHT_KEY && options.forwardSeconds === 5)
  );
}
/**
 *
 * @param {KeyboardEvent} event
 * @param {{ rewindSeconds: number, forwardSeconds: number, shouldOverrideKeys: boolean, }} options
 * @param {HTMLVideoElement} video
 */
function overrideArrowKeys(event, options, video) {
  if (isShouldSkipOverrideKeys(event.key, options)) {
    return;
  }
  event.preventDefault();
  updateVideoTime({
    seconds: getSeconds(event.key, options),
    video,
    updateType: event.key,
  });
}

// handle mouse over events
function mouseEnter() {
  const textWrapper = document.querySelector('div.ytp-tooltip-text-wrapper');
  const tooltipContainer = textWrapper.parentNode;
  const textSpan = textWrapper.querySelector('span.ytp-tooltip-text');

  // elements height for calculate the top of the button
  const playerContainerHeight = document.querySelector('div#player-container')
    .clientHeight;
  const bottomControlsHeight = document.querySelector('div.ytp-chrome-bottom')
    .clientHeight;
  const buttonHeight = this.clientHeight;
  const tooltipTopPosition =
    playerContainerHeight - bottomControlsHeight - buttonHeight;

  // change values
  tooltipContainer.classList.add('ytp-tooltip');
  tooltipContainer.classList.add('ytp-bottom');
  tooltipContainer.classList.remove('ytp-preview');
  tooltipContainer.classList.remove('ytp-text-detail');
  tooltipContainer.classList.remove('ytp-has-duration');
  tooltipContainer.style.display = 'block';
  tooltipContainer.style.maxWidth = '300px';
  tooltipContainer.style.top = `${tooltipTopPosition}px`;
  tooltipContainer.style.left = `${this.offsetLeft - this.offsetWidth}px`;
  tooltipContainer.setAttribute('aria-hidden', false);
  textSpan.innerHTML = this.title;

  // remove title from the button
  this.title = '';
}

function mouseLeave() {
  const textWrapper = document.querySelector('div.ytp-tooltip-text-wrapper');
  const tooltipContainer = textWrapper.parentNode;
  const textSpan = textWrapper.querySelector('span.ytp-tooltip-text');

  const title = textSpan.innerText;

  // change values
  tooltipContainer.style.display = 'none';
  tooltipContainer.setAttribute('aria-hidden', true);
  tooltipContainer.classList.remove('ytp-bottom');
  this.title = title;
}

function loadOptions() {
  return new Promise((resolve, reject) => {
    const options = {
      rewindSeconds: 5,
      forwardSeconds: 5,
      shouldOverrideKeys: false,
    };
    chrome.storage.sync.get(Object.keys(options), (loadedOptions) => {
      const error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
        reject(options);
      }
      Object.keys(loadedOptions ?? []).forEach((optionsKey) => {
        options[optionsKey] = loadedOptions[optionsKey] ?? options[optionsKey];
        const numberSeconds = parseInt(options[optionsKey], 10);
        if (!Number.isNaN(numberSeconds)) {
          options[optionsKey] = numberSeconds;
        }
      });
      resolve(options);
    });
  });
}

/**
 *
 * @param {{ rewindSeconds: number, forwardSeconds: number, shouldOverrideKeys: boolean, }} options
 * @param {HTMLVideoElement} video
 */
function getButtons(options, video) {
  const { shouldOverrideKeys, rewindSeconds, forwardSeconds } = options;
  const leftArrowTitle =
    shouldOverrideKeys || rewindSeconds === 5 ? ' (left arrow)' : '';
  const rightArrowTitle =
    shouldOverrideKeys || forwardSeconds === 5 ? ' (right arrow)' : '';

  const fastRewindButton = createButton({
    svg: `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 20 20"
  height="100%"
  width="80%"
>
  <path class="ytp-svg-fill" d="M19 5v10l-9-5 9-5zm-9 0v10l-9-5 9-5z" />
</svg>
`,
    title: `Go back ${rewindSeconds} seconds${leftArrowTitle}`,
  });
  const fastForwardButton = createButton({
    svg: `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 20 20"
  fill="white"
  height="100%"
  width="80%"
>
  <path class="ytp-svg-fill" d="M1 5l9 5-9 5V5zm9 0l9 5-9 5V5z" />
</svg>
`,
    title: `Go forward ${forwardSeconds} seconds${rightArrowTitle}`,
  });

  // add events listener
  fastRewindButton.addEventListener('click', () =>
    handleArrowButtons({
      video,
      seconds: options.rewindSeconds,
      updateType: UPDATE_TYPE.ARROW_LEFT_KEY,
    })
  );
  fastForwardButton.addEventListener('click', () =>
    handleArrowButtons({
      video,
      seconds: options.forwardSeconds,
      updateType: UPDATE_TYPE.ARROW_RIGHT_KEY,
    })
  );
  fastRewindButton.addEventListener('mouseenter', mouseEnter);
  fastRewindButton.addEventListener('mouseleave', mouseLeave);
  fastForwardButton.addEventListener('mouseenter', mouseEnter);
  fastForwardButton.addEventListener('mouseleave', mouseLeave);

  return { fastRewindButton, fastForwardButton };
}

async function run() {
  const options = await loadOptions();
  const video = document.querySelector('video');
  const customButton = document.querySelector(
    'button.custom-rewind-forward-buttons'
  );

  // check if there is no custom button already
  if (video?.src && !customButton) {
    const nextButton = document.querySelector(
      'div.ytp-left-controls a.ytp-next-button'
    );

    const { fastRewindButton, fastForwardButton } = getButtons(options, video);

    nextButton.insertAdjacentElement('afterend', fastForwardButton);
    nextButton.insertAdjacentElement('afterend', fastRewindButton);
    document.addEventListener(
      'keydown',
      (event) => overrideArrowKeys(event, options, video),
      { capture: true }
    );
  }
}

// in case the document is already rendered
if (document.readyState !== 'loading') {
  run();
} else if (document.addEventListener) {
  // modern browsers
  document.addEventListener('DOMContentLoaded', run);
}

// fire the function `run` every time that the URL changes under *"https://www.youtube.com/*"*
chrome.runtime.onMessage.addListener((data) => {
  if (data.message === 'urlChanged') {
    run();
  }
});
