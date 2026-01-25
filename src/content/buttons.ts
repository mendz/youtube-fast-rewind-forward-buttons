import { simulateKey } from './event-keys';
import { updateVideoTime } from './handle-video-player';
import {
  createButton,
  createFastDoubleForwardSVG,
  createFastDoubleRewindSVG,
  createFastForwardSVG,
  createFastRewindSVG,
  createForwardButtonTitle,
  createRewindButtonTitle,
  createTitle,
} from './helper';
import { teardownNativeButtonSyncIfUnused } from './button-styles-sync';
import { handleTooltipOnMouseLeave, handleTooltipOnMouseOver } from './tooltip';
import {
  ArrowKey,
  ButtonClassesIds,
  ButtonExtraStylesArg,
  IOptions,
  VideoTimeArg,
} from './types';
import { YouTubeSelectors } from './selectors';

export function handleArrowButtons({
  seconds,
  video,
  updateType,
  isForceUpdate,
}: VideoTimeArg): void {
  if (seconds === 5 && !isForceUpdate) {
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
  const { shouldOverrideArrowKeys, rewindSeconds, forwardSeconds } = options;
  return createMainButtons(video, extraStyles, {
    shouldOverrideArrowKeys,
    rewindSeconds,
    forwardSeconds,
  });
}

export function getSecondaryButtons(
  options: IOptions,
  video: HTMLVideoElement,
  extraStyles: ButtonExtraStylesArg
): {
  doubleRewindButton: HTMLButtonElement;
  doubleForwardButton: HTMLButtonElement;
} {
  const { shouldOverrideArrowKeys, secondarySeconds } = options;
  const { rewindSeconds, forwardSeconds } = secondarySeconds;
  return createSecondaryButtons(video, extraStyles, {
    shouldOverrideArrowKeys,
    rewindSeconds,
    forwardSeconds,
  });
}

function createMainButtons(
  video: HTMLVideoElement,
  extraStyles: ButtonExtraStylesArg,
  secondsData: {
    shouldOverrideArrowKeys: boolean;
    rewindSeconds: number;
    forwardSeconds: number;
  }
) {
  const { shouldOverrideArrowKeys, rewindSeconds, forwardSeconds } =
    secondsData;
  const { svgClasses, svgUseHtml, svgPathClasses } = extraStyles;

  // set the buttons
  const fastRewindButton: HTMLButtonElement = createButton({
    svg: createFastRewindSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: createRewindButtonTitle(rewindSeconds, shouldOverrideArrowKeys),
    id: ButtonClassesIds.REWIND_ID,
  });
  const fastForwardButton: HTMLButtonElement = createButton({
    svg: createFastForwardSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: createForwardButtonTitle(forwardSeconds, shouldOverrideArrowKeys),
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

function createSecondaryButtons(
  video: HTMLVideoElement,
  extraStyles: ButtonExtraStylesArg,
  secondsData: {
    shouldOverrideArrowKeys: boolean;
    rewindSeconds: number;
    forwardSeconds: number;
  }
) {
  const { rewindSeconds, forwardSeconds } = secondsData;
  const { svgClasses, svgUseHtml, svgPathClasses } = extraStyles;

  // set the buttons
  const doubleRewindButton: HTMLButtonElement = createButton({
    svg: createFastDoubleRewindSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: createTitle(rewindSeconds, 'back'),
    id: ButtonClassesIds.DOUBLE_REWIND_ID,
  });
  const doubleForwardButton: HTMLButtonElement = createButton({
    svg: createFastDoubleForwardSVG(svgClasses, svgUseHtml, svgPathClasses),
    title: createTitle(forwardSeconds, 'forward'),
    id: ButtonClassesIds.DOUBLE_FORWARD_ID,
  });

  // add events listener
  doubleRewindButton.addEventListener('click', () => {
    updateVideoTime({
      seconds: rewindSeconds,
      video,
      updateType: ArrowKey.ARROW_LEFT_KEY,
    });
  });
  doubleForwardButton.addEventListener('click', () => {
    updateVideoTime({
      seconds: forwardSeconds,
      video,
      updateType: ArrowKey.ARROW_RIGHT_KEY,
    });
  });

  doubleRewindButton.addEventListener('mouseenter', handleTooltipOnMouseOver);
  doubleRewindButton.addEventListener('mouseleave', handleTooltipOnMouseLeave);
  doubleForwardButton.addEventListener('mouseenter', handleTooltipOnMouseOver);
  doubleForwardButton.addEventListener('mouseleave', handleTooltipOnMouseLeave);

  return { doubleRewindButton, doubleForwardButton };
}

export function addButtonsToVideo(
  newOptions: IOptions,
  video: HTMLVideoElement
): void {
  const playerControls = document.querySelector(
    YouTubeSelectors.Player.CONTROLS_LEFT
  );
  const playerNextButton: Nullable<HTMLButtonElement> =
    playerControls?.querySelector(YouTubeSelectors.Player.NEXT_BUTTON) ?? null;
  const playerPlayButton: Nullable<HTMLButtonElement> =
    playerControls?.querySelector(YouTubeSelectors.Player.PLAY_BUTTON) ?? null;
  const anchorButton = playerNextButton ?? playerPlayButton;

  if (!anchorButton) {
    return;
  }

  // copy all svg values from the player button
  const svgClasses: string[] = [
    ...(anchorButton.querySelector('svg')?.classList ?? []),
  ];
  const svgPathClasses: string[] = [
    ...(anchorButton.querySelector('svg path')?.classList ?? []),
  ];
  const svgUseHtml: string =
    anchorButton.querySelector('svg use')?.outerHTML ?? '';

  const { fastRewindButton, fastForwardButton } = exportFunctions.getButtons(
    newOptions,
    video,
    {
      svgClasses,
      svgPathClasses,
      svgUseHtml,
    }
  );

  // add the buttons to the player, if checkboxIsEnabled is true add also the secondary buttons
  if (newOptions.secondarySeconds.checkboxIsEnabled) {
    const { doubleRewindButton, doubleForwardButton } =
      exportFunctions.getSecondaryButtons(newOptions, video, {
        svgClasses,
        svgPathClasses,
        svgUseHtml,
      });
    anchorButton.insertAdjacentElement('afterend', doubleForwardButton);
    anchorButton.insertAdjacentElement('afterend', fastForwardButton);
    anchorButton.insertAdjacentElement('afterend', fastRewindButton);
    anchorButton.insertAdjacentElement('afterend', doubleRewindButton);
  } else {
    anchorButton.insertAdjacentElement('afterend', fastForwardButton);
    anchorButton.insertAdjacentElement('afterend', fastRewindButton);
  }
}

function removeButtonsByIds(buttonIds: string[]): void {
  buttonIds.forEach((id) => {
    const button = document.querySelector(`button#${id}`);
    if (button) {
      button.remove();
    }
  });

  teardownNativeButtonSyncIfUnused();
}

export function updateButtons(
  newOptions: IOptions,
  video: HTMLVideoElement
): void {
  // Ensure buttons are removed if they exist
  const buttonIds = [
    ButtonClassesIds.REWIND_ID,
    ButtonClassesIds.FORWARD_ID,
    ButtonClassesIds.DOUBLE_REWIND_ID,
    ButtonClassesIds.DOUBLE_FORWARD_ID,
  ];

  removeButtonsByIds(buttonIds);

  // Add new buttons to the video
  exportFunctions.addButtonsToVideo(newOptions, video);
}

// https://medium.com/@DavideRama/mock-spy-exported-functions-within-a-single-module-in-jest-cdf2b61af642
const exportFunctions = {
  handleArrowButtons,
  getButtons,
  getSecondaryButtons,
  addButtonsToVideo,
};

export default exportFunctions;
