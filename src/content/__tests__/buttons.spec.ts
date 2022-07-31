import { ArrowKey } from '../types';
import {
  DEFAULT_OPTIONS_MOCK,
  SVG_CLASSES_MOCK,
  SVG_PATH_CLASSES_MOCK,
  SVG_USE_HTML_MOCK,
} from '../__utils__/tests-helper';
import * as eventKeys from '../event-keys';
import * as handleVideoPlayer from '../handle-video-player';
import buttons, { getButtons, handleArrowButtons } from '../buttons';

describe('handleArrowButtons', () => {
  const videoElement = document.createElement('video');
  let simulateKeySpy: jest.SpyInstance<void, [key: ArrowKey]> = jest.spyOn(
    eventKeys,
    'simulateKey'
  );
  let updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');

  beforeAll(async () => {
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
  const simulateHandleArrowButtons = jest.spyOn(buttons, 'handleArrowButtons');

  afterEach(() => {
    simulateHandleArrowButtons.mockReset();
  });

  it('Should call handleArrowButtons when using the buttons', () => {
    const { fastForwardButton, fastRewindButton } = getButtons(
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
