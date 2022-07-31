import { simulateKey } from './event-keys';
import {
  createButton,
  createFastRewindSVG,
  createRewindButtonTitle,
  createFastForwardSVG,
  createForwardButtonTitle,
} from './helper';
import { updateVideoTime } from './handle-video-player';
import { handleTooltipOnMouseOver, handleTooltipOnMouseLeave } from './tooltip';
import {
  ArrowKey,
  ButtonClassesIds,
  ButtonExtraStylesArg,
  VideoTimeArg,
} from './types';

export function handleArrowButtons({
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

export function getButtons(
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
    svg: createFastRewindSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: createRewindButtonTitle(rewindSeconds, shouldOverrideKeys),
    id: ButtonClassesIds.REWIND_ID,
  });
  const fastForwardButton: HTMLButtonElement = createButton({
    svg: createFastForwardSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: createForwardButtonTitle(forwardSeconds, shouldOverrideKeys),
    id: ButtonClassesIds.FORWARD_ID,
  });

  // add events listener
  fastRewindButton.addEventListener('click', () =>
    exportFunctions.handleArrowButtons({
      video,
      seconds: rewindSeconds,
      updateType: ArrowKey.ARROW_LEFT_KEY,
    })
  );
  fastForwardButton.addEventListener('click', () =>
    exportFunctions.handleArrowButtons({
      video,
      seconds: forwardSeconds,
      updateType: ArrowKey.ARROW_RIGHT_KEY,
    })
  );
  fastRewindButton.addEventListener('mouseenter', handleTooltipOnMouseOver);
  fastRewindButton.addEventListener('mouseleave', handleTooltipOnMouseLeave);
  fastForwardButton.addEventListener('mouseenter', handleTooltipOnMouseOver);
  fastForwardButton.addEventListener('mouseleave', handleTooltipOnMouseLeave);

  return { fastRewindButton, fastForwardButton };
}

export function updateButtons(newOptions: IOptions): void {
  const { forwardSeconds, rewindSeconds, shouldOverrideKeys } = newOptions;
  // set the buttons titles
  const rewindButton = document.querySelector(
    `button#${ButtonClassesIds.REWIND_ID}`
  ) as HTMLButtonElement;
  const forwardButton = document.querySelector(
    `button#${ButtonClassesIds.FORWARD_ID}`
  ) as HTMLButtonElement;

  rewindButton.title = createRewindButtonTitle(
    rewindSeconds,
    shouldOverrideKeys
  );
  forwardButton.title = createForwardButtonTitle(
    forwardSeconds,
    shouldOverrideKeys
  );
}

// https://medium.com/@DavideRama/mock-spy-exported-functions-within-a-single-module-in-jest-cdf2b61af642
const exportFunctions = {
  handleArrowButtons,
  getButtons,
  updateButtons,
};

export default exportFunctions;
