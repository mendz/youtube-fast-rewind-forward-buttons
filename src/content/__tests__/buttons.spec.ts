import { chrome } from 'jest-chrome';
import {
  DEFAULT_OPTIONS_MOCK,
  HTML_PLAYER_FULL,
  SVG_CLASSES_MOCK,
  SVG_DOUBLE_FORWARD_USE_HTML_MOCK,
  SVG_DOUBLE_REWIND_USE_HTML_MOCK,
  SVG_FORWARD_USE_HTML_MOCK,
  SVG_PATH_CLASSES_MOCK,
  SVG_REWIND_USE_HTML_MOCK,
} from '../__utils__/tests-helper';
import buttons, {
  addButtonsToVideo,
  handleArrowButtons,
  updateButtons,
} from '../buttons';
import { loadOptions } from '../content';
import * as eventKeys from '../event-keys';
import * as handleVideoPlayer from '../handle-video-player';
import { ArrowKey, ButtonClassesIds } from '../types';

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

describe('getSecondaryButtons', () => {
  const video = document.createElement('video');

  const { doubleRewindButton, doubleForwardButton } =
    buttons.getSecondaryButtons(DEFAULT_OPTIONS_MOCK, video, {
      svgClasses: SVG_CLASSES_MOCK,
      svgPathClasses: SVG_PATH_CLASSES_MOCK,
      svgUseHtml: SVG_FORWARD_USE_HTML_MOCK,
    });

  it('Should get the doubleRewindButton values and the correct svg', () => {
    const rewindSvg = doubleRewindButton.querySelector('svg');

    expect(doubleForwardButton.id).toBe(ButtonClassesIds.DOUBLE_FORWARD_ID);
    expect(doubleRewindButton.title.toLowerCase()).toContain('back');
    expect(doubleForwardButton.title.toLowerCase()).toContain('forward');
    expect(rewindSvg).not.toBeNull();
    // check svg element classes
    expect(rewindSvg?.classList.contains(SVG_CLASSES_MOCK[0])).toBe(true);
    expect(
      rewindSvg
        ?.querySelector('path')
        ?.classList.contains(SVG_PATH_CLASSES_MOCK[0])
    ).toBe(true);
    expect(rewindSvg?.querySelector('use')?.outerHTML).toBe(
      SVG_DOUBLE_REWIND_USE_HTML_MOCK
    );
  });

  it('Should get the doubleForwardButton values and the correct svg', () => {
    const forwardSvg = doubleForwardButton.querySelector('svg');

    expect(doubleForwardButton.id).toBe(ButtonClassesIds.DOUBLE_FORWARD_ID);
    expect(doubleRewindButton.title.toLowerCase()).toContain('back');
    expect(doubleForwardButton.title.toLowerCase()).toContain('forward');
    expect(forwardSvg).not.toBeNull();
    // check svg element classes
    expect(forwardSvg?.classList.contains(SVG_CLASSES_MOCK[0])).toBe(true);
    expect(
      forwardSvg
        ?.querySelector('path')
        ?.classList.contains(SVG_PATH_CLASSES_MOCK[0])
    ).toBe(true);
    expect(forwardSvg?.querySelector('use')?.outerHTML).toBe(
      SVG_DOUBLE_FORWARD_USE_HTML_MOCK
    );
  });

  it('should run updateVideoTime on button click', () => {
    const updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');
    // simulate click on doubleRewindButton
    doubleRewindButton.click();
    expect(updateVideoTimeSpy).toHaveBeenCalledWith({
      seconds: DEFAULT_OPTIONS_MOCK.secondarySeconds.rewindSeconds,
      video,
      updateType: ArrowKey.ARROW_LEFT_KEY,
    });
    updateVideoTimeSpy.mockClear();
    // simulate click on doubleForwardButton
    doubleForwardButton.click();
    expect(updateVideoTimeSpy).toHaveBeenCalledWith({
      seconds: DEFAULT_OPTIONS_MOCK.secondarySeconds.forwardSeconds,
      video,
      updateType: ArrowKey.ARROW_RIGHT_KEY,
    });
    updateVideoTimeSpy.mockRestore();
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
    expect(getButtonsSpy).toHaveBeenCalledWith(DEFAULT_OPTIONS_MOCK, video, {
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
    expect(getButtonsSpy).toHaveBeenCalledWith(DEFAULT_OPTIONS_MOCK, video, {
      svgClasses: ['test-class'],
      svgPathClasses: ['ytp-svg-fill'],
      svgUseHtml: '<use></use>',
    });
  });
});

describe('addButtonsToVideo order insertion', () => {
  let dummyVideo: HTMLVideoElement;
  beforeEach(() => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    dummyVideo = document.createElement('video');
  });

  function getSiblingsAfterNextButton(): HTMLElement[] {
    const nextButton = document.querySelector('a.ytp-next-button');
    const siblings: HTMLElement[] = [];
    let el = nextButton?.nextElementSibling as HTMLElement | null;
    while (el) {
      siblings.push(el);
      el = el.nextElementSibling as HTMLElement | null;
    }
    return siblings;
  }

  it('inserts buttons in correct order when secondary checkbox is enabled', () => {
    addButtonsToVideo(
      {
        ...DEFAULT_OPTIONS_MOCK,
        secondarySeconds: {
          checkboxIsEnabled: true,
          rewindSeconds: 5,
          forwardSeconds: 5,
        },
      },
      dummyVideo
    );
    const siblings = getSiblingsAfterNextButton();
    // Insertion calls produce final order: [DOUBLE_REWIND, REWIND, FORWARD, DOUBLE_FORWARD]
    const expectedOrder = [
      ButtonClassesIds.DOUBLE_REWIND_ID,
      ButtonClassesIds.REWIND_ID,
      ButtonClassesIds.FORWARD_ID,
      ButtonClassesIds.DOUBLE_FORWARD_ID,
    ];
    const actualOrder = siblings.map((el) => el.id);
    expect(actualOrder).toEqual(expectedOrder);
  });

  it('inserts buttons in correct order when secondary checkbox is disabled', () => {
    addButtonsToVideo(DEFAULT_OPTIONS_MOCK, dummyVideo);
    const siblings = getSiblingsAfterNextButton();
    // Insertion calls produce final order: [REWIND, FORWARD]
    const expectedOrder = [
      ButtonClassesIds.REWIND_ID,
      ButtonClassesIds.FORWARD_ID,
    ];
    const actualOrder = siblings.map((el) => el.id);
    expect(actualOrder).toEqual(expectedOrder);
  });
});

describe('updateButtons', () => {
  let removeSpyRewind: jest.SpyInstance;
  let removeSpyForward: jest.SpyInstance;
  let removeSpyDoubleRewind: jest.SpyInstance;
  let removeSpyDoubleForward: jest.SpyInstance;
  let addButtonsToVideoSpy: jest.SpyInstance;
  let dummyVideo: HTMLVideoElement;
  const newOptions = { ...DEFAULT_OPTIONS_MOCK };

  beforeEach(() => {
    removeSpyRewind = jest.fn();
    removeSpyForward = jest.fn();
    removeSpyDoubleRewind = jest.fn();
    removeSpyDoubleForward = jest.fn();

    document.body.innerHTML = HTML_PLAYER_FULL;

    // Setup dummy buttons with spied remove methods.
    const rewindButton = document.createElement('button');
    rewindButton.id = ButtonClassesIds.REWIND_ID;
    rewindButton.remove = removeSpyRewind as any;

    const forwardButton = document.createElement('button');
    forwardButton.id = ButtonClassesIds.FORWARD_ID;
    forwardButton.remove = removeSpyForward as any;

    const doubleRewindButton = document.createElement('button');
    doubleRewindButton.id = ButtonClassesIds.DOUBLE_REWIND_ID;
    doubleRewindButton.remove = removeSpyDoubleRewind as any;

    const doubleForwardButton = document.createElement('button');
    doubleForwardButton.id = ButtonClassesIds.DOUBLE_FORWARD_ID;
    doubleForwardButton.remove = removeSpyDoubleForward as any;

    document.body.append(
      rewindButton,
      forwardButton,
      doubleRewindButton,
      doubleForwardButton
    );

    dummyVideo = document.createElement('video');
    addButtonsToVideoSpy = jest.spyOn(buttons, 'addButtonsToVideo');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    addButtonsToVideoSpy.mockRestore();
  });

  it('calls remove on each button and then addButtonsToVideo with correct args', () => {
    updateButtons(newOptions, dummyVideo);
    expect(removeSpyRewind).toHaveBeenCalledTimes(1);
    expect(removeSpyForward).toHaveBeenCalledTimes(1);
    expect(removeSpyDoubleRewind).toHaveBeenCalledTimes(1);
    expect(removeSpyDoubleForward).toHaveBeenCalledTimes(1);
    expect(addButtonsToVideoSpy).toHaveBeenCalledWith(newOptions, dummyVideo);
  });
});
