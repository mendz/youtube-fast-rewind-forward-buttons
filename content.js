/* global chrome */

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
 * 
 * @param {string} keyCode 
 */
function simulateKey(keyCode) {
  const event = new KeyboardEvent('keydown', {
    keyCode,
    which: keyCode,
  });
  document.dispatchEvent(event);
}

/**
 * handle click events
 * @param {{ seconds: number, video: HTMLVideoElement }} param0 
 */
function rewind({ seconds = 5, video }) {
  // video.currentTime -= parseFloat(seconds);
  simulateKey(37);
}

/**
 * handle click events
 * @param {{ seconds: number, video: HTMLVideoElement }} param0 
 */
function forward({ seconds = 5, video }) {
  // video.currentTime += parseFloat(seconds);
  simulateKey(39);
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

function run() {
  const video = document.querySelector('video');
  const customButton = document.querySelector(
    'button.custom-rewind-forward-buttons'
  );

  // check if there is no custom button already
  if (video?.src && !customButton) {
    const nextButton = document.querySelector('div.ytp-left-controls a.ytp-next-button');

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
      title: 'Go back 5 seconds (left arrow)',
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
      title: 'Go forward 5 seconds (right arrow)',
    });

    fastRewindButton.addEventListener('click', () => rewind({ video }));
    fastForwardButton.addEventListener('click', () => forward({ video }));
    fastRewindButton.addEventListener('mouseenter', mouseEnter);
    fastRewindButton.addEventListener('mouseleave', mouseLeave);
    fastForwardButton.addEventListener('mouseenter', mouseEnter);
    fastForwardButton.addEventListener('mouseleave', mouseLeave);

    nextButton.insertAdjacentElement('afterend', fastForwardButton);
    nextButton.insertAdjacentElement('afterend', fastRewindButton);
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
chrome.runtime.onMessage.addListener(data => {
  if (data.message === 'urlChanged') {
    run();
  }
});
