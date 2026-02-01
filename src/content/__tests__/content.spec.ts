import { chrome } from 'jest-chrome';
import * as buttons from '../buttons';
import * as eventKeys from '../event-keys';
import content, {
  run,
  loadOptions,
  mergeOptions,
  handleOverrideKeysMigration,
} from '../content';
import {
  DEFAULT_OPTIONS_MOCK,
  HTML_PLAYER_FULL,
  INITIAL_HTML_PLAYER_FULL,
} from '../__utils__/tests-helper';
import {
  ArrowKey,
  ButtonClassesIds,
  ChromeStorageChanges,
  IOptions,
  IStorageOptions,
  KEY_CODES,
  MediaTrackKey,
} from '../types';
import { YouTubeSelectors } from '../selectors';

describe('full run', () => {
  const originalConsoleError = console.error;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    console.error = jest.fn();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error = originalConsoleError;
    consoleWarnSpy.mockRestore();
  });

  it('Should run overrideArrowKeys when user press keydown', async () => {
    const overrideArrowKeysSpy = jest.spyOn(eventKeys, 'overrideArrowKeys');
    await run();
    const event = new KeyboardEvent('keydown', {
      keyCode: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
      key: ArrowKey.ARROW_LEFT_KEY,
    });
    document.dispatchEvent(event);
    expect(overrideArrowKeysSpy).toHaveBeenCalledTimes(1); // TODO: continue to look over of how to clear the document listeners, it called 4 times because of the 4 run() if this test placed in the end
    overrideArrowKeysSpy.mockClear();
    overrideArrowKeysSpy.mockReset();
  });

  it('Should run overrideMediaKeys when user press keydown', async () => {
    const overrideMediaKeysSpy = jest.spyOn(eventKeys, 'overrideMediaKeys');
    await run();
    const event = new KeyboardEvent('keydown', {
      keyCode: KEY_CODES[MediaTrackKey.MEDIA_TRACK_PREVIOUS],
      key: MediaTrackKey.MEDIA_TRACK_PREVIOUS,
    });
    document.dispatchEvent(event);
    expect(overrideMediaKeysSpy).toHaveBeenCalled();
    overrideMediaKeysSpy.mockClear();
    overrideMediaKeysSpy.mockReset();
  });

  it('should have 2 buttons', async () => {
    await run();
    expect(
      document.querySelectorAll('button.ml-custom-rewind-forward-buttons')
        ?.length
    ).toEqual(2);
  });

  it('should have no button when there is no video', async () => {
    document.querySelector(YouTubeSelectors.Player.VIDEO)?.remove();
    await run();
    expect(
      document.querySelectorAll('button.ml-custom-rewind-forward-buttons')
        ?.length
    ).toEqual(0);
  });

  it('Should add buttons when next button is missing', async () => {
    document
      .querySelector(
        `${YouTubeSelectors.Player.CONTROLS_LEFT} ${YouTubeSelectors.Player.NEXT_BUTTON}`
      )
      ?.remove();
    const leftControls = document.querySelector(
      YouTubeSelectors.Player.CONTROLS_LEFT
    );
    const playButton = document.createElement('button');
    playButton.className = 'ytp-play-button';
    leftControls?.appendChild(playButton);
    await run();
    expect(
      document.querySelectorAll('button.ml-custom-rewind-forward-buttons')
        ?.length
    ).toEqual(2);
  });

  it('Should not add buttons when there is no anchor button', async () => {
    document
      .querySelector(
        `${YouTubeSelectors.Player.CONTROLS_LEFT} ${YouTubeSelectors.Player.NEXT_BUTTON}`
      )
      ?.remove();
    document
      .querySelector(
        `${YouTubeSelectors.Player.CONTROLS_LEFT} ${YouTubeSelectors.Player.PLAY_BUTTON}`
      )
      ?.remove();
    await run();
    expect(
      document.querySelectorAll('button.ml-custom-rewind-forward-buttons')
        ?.length
    ).toEqual(0);
  });

  it('Should pass to addButtonsToVideo options and video', async () => {
    // set all the mockups
    const video = document.querySelector(YouTubeSelectors.Player.VIDEO);
    chrome.storage.sync.get.mockReturnValue(DEFAULT_OPTIONS_MOCK as any);
    const addButtonsToVideoSpy = jest.spyOn(buttons, 'addButtonsToVideo');

    await run();
    expect(addButtonsToVideoSpy).toHaveBeenCalledWith(
      DEFAULT_OPTIONS_MOCK,
      video
    );
  });

  it('Should addEventListener when run', async () => {
    // set all the mockups
    chrome.storage.sync.get.mockReturnValue(DEFAULT_OPTIONS_MOCK as any);
    document.removeEventListener = jest.fn();
    document.addEventListener = jest.fn();

    await run();
    expect(document.removeEventListener).toHaveBeenCalled();
    expect(document.addEventListener).toHaveBeenCalled();
  });

  it('Should show the correct titles for the buttons', async () => {
    chrome.storage.sync.get.mockReturnValue(DEFAULT_OPTIONS_MOCK as any);
    await run();

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

  it('Should handle options with unsparing number', async () => {
    const optionsMock = {
      forwardSeconds: '|',
      rewindSeconds: 7,
      shouldOverrideKeys: true,
    };
    chrome.storage.sync.get.mockReturnValue(optionsMock as any);
    await run();

    const forwardButton = document.querySelector(
      `button#${ButtonClassesIds.FORWARD_ID}`
    ) as HTMLButtonElement;
    expect(forwardButton.title).toBe(
      `Go forward ${DEFAULT_OPTIONS_MOCK.forwardSeconds} seconds (right arrow)`
    );
  });

  it('should call run and observeVideoSrcChange after finding video element via initializeExtension', async () => {
    // Setup RAF mock
    let rafCallbacks: FrameRequestCallback[] = [];
    let rafId = 0;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return ++rafId;
    });

    const flushRAF = (count = 1): void => {
      for (let i = 0; i < count; i++) {
        const callbacks = [...rafCallbacks];
        rafCallbacks = [];
        callbacks.forEach((cb) => cb(performance.now()));
      }
    };

    document.body.innerHTML = INITIAL_HTML_PLAYER_FULL;
    const runSpy = jest.spyOn(content, 'run');
    const observeSpy = jest.spyOn(content, 'observeVideoSrcChange');

    // Start initialization (will wait for elements)
    const initPromise = content.initializeExtension();

    // Flush a few RAF frames (elements not ready yet)
    flushRAF(3);

    // Add video element to DOM
    const videoMock = document.createElement('video');
    videoMock.src = 'test';
    videoMock.classList.add('video-stream', 'html5-main-video');
    document.querySelector('.html5-video-container')?.appendChild(videoMock);

    // Flush more RAF frames to detect elements
    flushRAF(2);

    await initPromise;

    expect(runSpy).toHaveBeenCalled();
    expect(observeSpy).toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});

describe('loadOptions', () => {
  const originalConsoleError = console.error;

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('Should return the values from the storage if exists', async () => {
    const options: IOptions = {
      rewindSeconds: 10,
      forwardSeconds: 2,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: true,
    };
    chrome.storage.sync.get.mockReturnValue(options as any);
    const loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject(options);
  });

  it(`Should return the default value from if the on storage doesn't exists`, async () => {
    const options: Partial<IOptions> = {
      rewindSeconds: 10,
      shouldOverrideArrowKeys: true,
    };
    chrome.storage.sync.get.mockReturnValue({ ...options } as any);
    let loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject({
      ...options,
      forwardSeconds: DEFAULT_OPTIONS_MOCK.forwardSeconds,
      shouldOverrideMediaKeys: DEFAULT_OPTIONS_MOCK.shouldOverrideMediaKeys,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
    });

    chrome.storage.sync.get.mockReturnValue({
      ...options,
      rewindSeconds: '|',
    } as any);
    loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject({
      ...options,
      forwardSeconds: DEFAULT_OPTIONS_MOCK.forwardSeconds,
      rewindSeconds: DEFAULT_OPTIONS_MOCK.rewindSeconds,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
    });

    const options2 = {
      rewindSeconds: 10,
    };
    chrome.storage.sync.get.mockReturnValue(options2 as any);
    loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject({
      ...options2,
      forwardSeconds: DEFAULT_OPTIONS_MOCK.forwardSeconds,
      shouldOverrideArrowKeys: DEFAULT_OPTIONS_MOCK.shouldOverrideArrowKeys,
      shouldOverrideMediaKeys: DEFAULT_OPTIONS_MOCK.shouldOverrideMediaKeys,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
    });

    const options3 = {
      shouldOverrideMediaKeys: true,
    };
    chrome.storage.sync.get.mockReturnValue(options3 as any);
    loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject({
      ...options3,
      rewindSeconds: DEFAULT_OPTIONS_MOCK.rewindSeconds,
      forwardSeconds: DEFAULT_OPTIONS_MOCK.forwardSeconds,
      shouldOverrideArrowKeys: DEFAULT_OPTIONS_MOCK.shouldOverrideArrowKeys,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
    });
  });

  it('Should catch the error and return the default values', async () => {
    const errorMessage = 'something happened!';
    console.error = jest.fn();
    chrome.storage.sync.get.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    const loadedOptions = await loadOptions();
    expect(console.error).toHaveBeenCalledWith(new Error(errorMessage));
    expect(loadedOptions).toMatchObject(DEFAULT_OPTIONS_MOCK);
  });
});

describe('mergeOptions', () => {
  it('Should return the merge options', () => {
    const optionsMock: IOptions = {
      forwardSeconds: 2,
      rewindSeconds: 7,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: false,
    };
    const changeOptionsMock: ChromeStorageChanges = {
      rewindSeconds: {
        oldValue: optionsMock.rewindSeconds,
        newValue: DEFAULT_OPTIONS_MOCK.rewindSeconds,
      },
      shouldOverrideArrowKeys: {
        oldValue: optionsMock.shouldOverrideArrowKeys,
        newValue: DEFAULT_OPTIONS_MOCK.shouldOverrideArrowKeys,
      },
      shouldOverrideMediaKeys: {
        oldValue: optionsMock.shouldOverrideMediaKeys,
        newValue: true,
      },
    };
    const returnedOptions = mergeOptions(changeOptionsMock, optionsMock);

    const returnValueToTest = {
      rewindSeconds: DEFAULT_OPTIONS_MOCK.rewindSeconds,
      forwardSeconds: optionsMock.forwardSeconds,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
      shouldOverrideArrowKeys: DEFAULT_OPTIONS_MOCK.shouldOverrideArrowKeys,
      shouldOverrideMediaKeys: true,
    };
    expect(returnedOptions).toMatchObject(returnValueToTest);
  });

  it('Should handle un-parsing number', () => {
    const optionsMock: IOptions = {
      forwardSeconds: 2,
      rewindSeconds: 7,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: false,
    };
    const changeOptionsMock: ChromeStorageChanges = {
      rewindSeconds: {
        oldValue: optionsMock.rewindSeconds,
        newValue: DEFAULT_OPTIONS_MOCK.rewindSeconds,
      },
      forwardSeconds: {
        oldValue: optionsMock.forwardSeconds,
        newValue: '|',
      },
      shouldOverrideArrowKeys: {
        oldValue: optionsMock.shouldOverrideArrowKeys,
        newValue: DEFAULT_OPTIONS_MOCK.shouldOverrideArrowKeys,
      },
    };
    const returnedOptions = mergeOptions(changeOptionsMock, optionsMock);

    const returnValueToTest = {
      rewindSeconds: DEFAULT_OPTIONS_MOCK.rewindSeconds,
      forwardSeconds: optionsMock.forwardSeconds,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
      shouldOverrideArrowKeys: DEFAULT_OPTIONS_MOCK.shouldOverrideArrowKeys,
      shouldOverrideMediaKeys: optionsMock.shouldOverrideMediaKeys,
    };
    expect(returnedOptions).toMatchObject(returnValueToTest);
  });
});

describe('handleOverrideKeysMigration', () => {
  it('Should return true, if the old value is true or if the old value if false/undefined and the new value is true', () => {
    const defaultOptions: Readonly<IOptions> = {
      rewindSeconds: 5,
      forwardSeconds: 5,
      secondarySeconds: DEFAULT_OPTIONS_MOCK.secondarySeconds,
      shouldOverrideKeys: false,
      shouldOverrideArrowKeys: false,
      shouldOverrideMediaKeys: false,
    };

    let storageOptions: IStorageOptions = {
      rewindSeconds: '5',
      forwardSeconds: '5',
      shouldOverrideKeys: true,
      shouldOverrideArrowKeys: false,
      shouldOverrideMediaKeys: false,
      secondarySeconds: {
        checkboxIsEnabled: false,
        rewindSeconds: '5',
        forwardSeconds: '5',
      },
    };

    const result = handleOverrideKeysMigration(defaultOptions, storageOptions);

    expect(result).toBe(true);

    storageOptions = {
      rewindSeconds: '5',
      forwardSeconds: '5',
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: false,
      secondarySeconds: {
        checkboxIsEnabled: false,
        rewindSeconds: '5',
        forwardSeconds: '5',
      },
    };

    const result2 = handleOverrideKeysMigration(defaultOptions, storageOptions);

    expect(result2).toBe(true);

    storageOptions = {
      rewindSeconds: '5',
      forwardSeconds: '5',
      shouldOverrideKeys: false,
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: false,
      secondarySeconds: {
        checkboxIsEnabled: false,
        rewindSeconds: '5',
        forwardSeconds: '5',
      },
    };

    const result3 = handleOverrideKeysMigration(defaultOptions, storageOptions);

    expect(result3).toBe(true);

    storageOptions = {
      rewindSeconds: '5',
      forwardSeconds: '5',
      shouldOverrideKeys: false,
      shouldOverrideArrowKeys: false,
      shouldOverrideMediaKeys: true,
      secondarySeconds: {
        checkboxIsEnabled: false,
        rewindSeconds: '5',
        forwardSeconds: '5',
      },
    };

    const result4 = handleOverrideKeysMigration(defaultOptions, storageOptions);

    expect(result4).toBe(false);
  });
});
