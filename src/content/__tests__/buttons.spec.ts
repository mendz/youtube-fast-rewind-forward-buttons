import { chrome } from 'jest-chrome';
import { ArrowKey, ButtonClassesIds } from '../types';
import {
  DEFAULT_OPTIONS_MOCK,
  SVG_CLASSES_MOCK,
  SVG_PATH_CLASSES_MOCK,
  SVG_FORWARD_USE_HTML_MOCK,
  SVG_REWIND_USE_HTML_MOCK,
  HTML_PLAYER_FULL,
} from '../__utils__/tests-helper';
import * as eventKeys from '../event-keys';
import * as handleVideoPlayer from '../handle-video-player';
import buttons, {
  addButtonsToVideo,
  handleArrowButtons,
  updateButtonsTitles,
} from '../buttons';
import { loadOptions } from '../content';

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

  const { fastForwardButton, fastRewindButton } = buttons.getButtons(
    DEFAULT_OPTIONS_MOCK,
    videoElement,
    {
      svgClasses: SVG_CLASSES_MOCK,
      svgPathClasses: SVG_PATH_CLASSES_MOCK,
      svgUseHtml: SVG_FORWARD_USE_HTML_MOCK,
    }
  );

  it('Should call handleArrowButtons when using the buttons', () => {
    const simulateHandleArrowButtons = jest.spyOn(
      buttons,
      'handleArrowButtons'
    );
    fastForwardButton.click();
    fastRewindButton.click();
    expect(simulateHandleArrowButtons).toHaveBeenCalledTimes(2);
  });

  it('Should get the fastForwardButton values and the correct svg', () => {
    const forwardSvg = fastForwardButton.querySelector('svg');

    expect(fastForwardButton.id).toBe(ButtonClassesIds.FORWARD_ID);
    expect(fastForwardButton.title).toBe(
      `Go forward ${DEFAULT_OPTIONS_MOCK.forwardSeconds} seconds (right arrow)`
    );
    expect(forwardSvg?.classList.contains(SVG_CLASSES_MOCK[0])).toBe(true);
    expect(
      forwardSvg
        ?.querySelector('path')
        ?.classList.contains(SVG_PATH_CLASSES_MOCK[0])
    ).toBe(true);
    expect(forwardSvg?.querySelector('use')?.outerHTML).toBe(
      SVG_FORWARD_USE_HTML_MOCK
    );
  });

  it('Should get the fastRewindButton values and the correct svg', () => {
    const rewindSvg = fastRewindButton.querySelector('svg');

    expect(fastRewindButton.id).toBe(ButtonClassesIds.REWIND_ID);
    expect(fastRewindButton.title).toBe(
      `Go back ${DEFAULT_OPTIONS_MOCK.rewindSeconds} seconds (left arrow)`
    );
    expect(rewindSvg?.classList.contains(SVG_CLASSES_MOCK[0])).toBe(true);
    expect(
      rewindSvg
        ?.querySelector('path')
        ?.classList.contains(SVG_PATH_CLASSES_MOCK[0])
    ).toBe(true);
    expect(rewindSvg?.querySelector('use')?.outerHTML).toBe(
      SVG_REWIND_USE_HTML_MOCK
    );
  });
});

describe('updateButtonsTitles', () => {
  document.body.innerHTML = /* html */ `
    <button id="${ButtonClassesIds.REWIND_ID}" title="test-rewind"></button>
    <button id="${ButtonClassesIds.FORWARD_ID}" title="test-forward"></button>
  `;
  it('Should have the correct button titles', () => {
    updateButtonsTitles(DEFAULT_OPTIONS_MOCK);
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

describe('addButtonsToVideo', () => {
  it('Should pass to getButtons the correct svg parts depends what in the page', async () => {
    // set all the mockups
    document.body.innerHTML = HTML_PLAYER_FULL;
    let video = document.querySelector('video') as HTMLVideoElement;
    chrome.storage.sync.get.mockReturnValue(DEFAULT_OPTIONS_MOCK as any);
    const options = await loadOptions();
    const getButtonsSpy = jest.spyOn(buttons, 'getButtons');
    // clear the dom from the svg parts
    document.querySelector('svg path')?.classList.remove('ytp-svg-fill');
    document.querySelector('svg use')?.remove();

    addButtonsToVideo(options, video);
    expect(getButtonsSpy).toBeCalledWith(DEFAULT_OPTIONS_MOCK, video, {
      svgClasses: [],
      svgPathClasses: [],
      svgUseHtml: '',
    });
    const rewindButton = document.querySelector(
      `button#${ButtonClassesIds.REWIND_ID}`
    );
    expect(rewindButton?.querySelector('svg')?.classList.length).toBe(0);

    getButtonsSpy.mockClear();
    document.body.innerHTML = HTML_PLAYER_FULL;
    document.querySelector('svg')?.classList.add('test-class');
    video = document.querySelector('video') as HTMLVideoElement;
    addButtonsToVideo(options, video);
    expect(getButtonsSpy).toBeCalledWith(DEFAULT_OPTIONS_MOCK, video, {
      svgClasses: ['test-class'],
      svgPathClasses: ['ytp-svg-fill'],
      svgUseHtml: '<use></use>',
    });
  });
});
