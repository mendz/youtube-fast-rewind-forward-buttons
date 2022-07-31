import { ArrowKey, ButtonClassesIds } from '../types';
import {
  DEFAULT_OPTIONS_MOCK,
  SVG_CLASSES_MOCK,
  SVG_PATH_CLASSES_MOCK,
  SVG_USE_HTML_MOCK,
} from '../__utils__/tests-helper';
import * as eventKeys from '../event-keys';
import * as handleVideoPlayer from '../handle-video-player';
import buttons, {
  getButtons,
  handleArrowButtons,
  updateButtons,
} from '../buttons';

describe('handleArrowButtons', () => {
  const videoElement = document.createElement('video');
  let simulateKeySpy: jest.SpyInstance<void, [key: ArrowKey]> = jest.spyOn(
    eventKeys,
    'simulateKey'
  );
  let updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');

  beforeEach(async () => {
    simulateKeySpy.mockClear();
    updateVideoTimeSpy.mockClear();
    simulateKeySpy = jest.spyOn(eventKeys, 'simulateKey');
    updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');
  });

  afterEach(() => {
    simulateKeySpy.mockReset();
  });

  it('should call simulateKey when the seconds === 5', () => {
    handleArrowButtons({
      seconds: 5,
      updateType: ArrowKey.ARROW_LEFT_KEY,
      video: videoElement,
    });
    expect(simulateKeySpy).toHaveBeenCalledTimes(1);
    expect(updateVideoTimeSpy).not.toHaveBeenCalled();
  });
  it('should call updateVideoTime when the seconds !==  5', () => {
    handleArrowButtons({
      seconds: 10,
      updateType: ArrowKey.ARROW_LEFT_KEY,
      video: videoElement,
    });
    expect(updateVideoTimeSpy).toHaveBeenCalledTimes(1);
    expect(simulateKeySpy).not.toHaveBeenCalled();
  });
});

describe('getButtons', () => {
  const videoElement = document.createElement('video');
  let simulateHandleArrowButtons = jest.spyOn(buttons, 'handleArrowButtons');

  beforeEach(() => {
    simulateHandleArrowButtons = jest.spyOn(buttons, 'handleArrowButtons');
  });

  it('Should call handleArrowButtons when using the buttons', () => {
    const { fastForwardButton, fastRewindButton } = buttons.getButtons(
      DEFAULT_OPTIONS_MOCK,
      videoElement,
      {
        svgClasses: SVG_CLASSES_MOCK,
        svgPathClasses: SVG_PATH_CLASSES_MOCK,
        svgUseHtml: SVG_USE_HTML_MOCK,
      }
    );

    fastForwardButton.click();
    fastRewindButton.click();
    expect(simulateHandleArrowButtons).toHaveBeenCalledTimes(2);
  });
});

describe('updateButtons', () => {
  document.body.innerHTML = /* html */ `
    <button id="${ButtonClassesIds.REWIND_ID}" title="test-rewind"></button>
    <button id="${ButtonClassesIds.FORWARD_ID}" title="test-forward"></button>
  `;
  it('Should have the correct button titles', () => {
    updateButtons(DEFAULT_OPTIONS_MOCK);
    const rewindButton = document.querySelector(
      `button#${ButtonClassesIds.REWIND_ID}`
    ) as HTMLButtonElement;
    const forwardButton = document.querySelector(
      `button#${ButtonClassesIds.FORWARD_ID}`
    ) as HTMLButtonElement;
    expect(rewindButton.title).toBe(
      `Go back ${DEFAULT_OPTIONS_MOCK.rewindSeconds} seconds (left arrow)`
    );
    expect(forwardButton.title).toBe(
      `Go forward ${DEFAULT_OPTIONS_MOCK.forwardSeconds} seconds (right arrow)`
    );
  });
});
