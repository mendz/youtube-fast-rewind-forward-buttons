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

describe('full run', () => {
  const originalConsoleError = console.error;
  beforeEach(() => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('Should run overrideArrowKeys when user press keydown', async () => {
    const overrideArrowKeysSpy = jest.spyOn(eventKeys, 'overrideArrowKeys');
    await run();
    const event = new KeyboardEvent('keydown', {
      keyCode: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
      key: ArrowKey.ARROW_LEFT_KEY,
    });
    document.dispatchEvent(event);
    expect(overrideArrowKeysSpy).toBeCalledTimes(1); // TODO: continue to look over of how to clear the document listeners, it called 4 times because of the 4 run() if this test placed in the end
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
    document.querySelector('video')?.remove();
    await run();
    expect(
      document.querySelectorAll('button.ml-custom-rewind-forward-buttons')
        ?.length
    ).toEqual(0);
  });

  it('Should console error when there is no player button', async () => {
    const errorMessage = 'No playerNextButton';
    document.querySelector('div.ytp-left-controls a.ytp-next-button')?.remove();
    await expect(run).rejects.toThrowError(errorMessage);
  });

  it('Should pass to addButtonsToVideo options and video', async () => {
    // set all the mockups
    const video = document.querySelector('video');
    chrome.storage.sync.get.mockReturnValue(DEFAULT_OPTIONS_MOCK as any);
    const addButtonsToVideoSpy = jest.spyOn(buttons, 'addButtonsToVideo');

    await run();
    expect(addButtonsToVideoSpy).toBeCalledWith(DEFAULT_OPTIONS_MOCK, video);
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

  it('should call run and observeVideoSrcChange after finding video element', async () => {
    jest.useFakeTimers();
    document.body.innerHTML = INITIAL_HTML_PLAYER_FULL;
    const runSpy = jest.spyOn(content, 'run');
    const observeSpy = jest.spyOn(content, 'observeVideoSrcChange');

    content.intervalQueryForVideo();

    // Fast-forward time to trigger interval
    jest.advanceTimersByTime(1000);

    const videoMock = document.createElement('video');
    videoMock.src = 'test';
    videoMock.classList.add('video-stream', 'html5-main-video');
    document.querySelector('.html5-video-container')?.appendChild(videoMock);

    jest.advanceTimersByTime(1000);

    expect(runSpy).toHaveBeenCalled();
    expect(observeSpy).toHaveBeenCalled();

    document.querySelector('video')!.src = 'test2';

    expect(runSpy).toHaveBeenCalled();
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
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: true,
      shouldShowButtonsTooltip: false,
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
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: false,
      shouldShowButtonsTooltip: false,
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
      shouldShowButtonsTooltip: {
        oldValue: optionsMock.shouldShowButtonsTooltip,
        newValue: true,
      },
    };
    const returnedOptions = mergeOptions(changeOptionsMock, optionsMock);

    const returnValueToTest = {
      ...DEFAULT_OPTIONS_MOCK,
      forwardSeconds: optionsMock.forwardSeconds,
      shouldOverrideMediaKeys: true,
    };
    expect(returnedOptions).toMatchObject(returnValueToTest);
  });

  it('Should handle un-parsing number', () => {
    const optionsMock: IOptions = {
      forwardSeconds: 2,
      rewindSeconds: 7,
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: false,
      shouldShowButtonsTooltip: true,
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
      ...DEFAULT_OPTIONS_MOCK,
      forwardSeconds: optionsMock.forwardSeconds,
    };
    expect(returnedOptions).toMatchObject(returnValueToTest);
  });
});

describe('handleOverrideKeysMigration', () => {
  it('Should return true, if the old value is true or if the old value if false/undefined and the new value is true', () => {
    const defaultOptions: Readonly<IOptions> = {
      rewindSeconds: 5,
      forwardSeconds: 5,
      shouldOverrideKeys: false,
      shouldOverrideArrowKeys: false,
      shouldOverrideMediaKeys: false,
      shouldShowButtonsTooltip: true,
    };

    let storageOptions: IStorageOptions = {
      rewindSeconds: '5',
      forwardSeconds: '5',
      shouldOverrideKeys: true,
      shouldOverrideArrowKeys: false,
      shouldOverrideMediaKeys: false,
      shouldShowButtonsTooltip: false,
    };

    const result = handleOverrideKeysMigration(defaultOptions, storageOptions);

    expect(result).toBe(true);

    storageOptions = {
      rewindSeconds: '5',
      forwardSeconds: '5',
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: false,
      shouldShowButtonsTooltip: false,
    };

    const result2 = handleOverrideKeysMigration(defaultOptions, storageOptions);

    expect(result2).toBe(true);

    storageOptions = {
      rewindSeconds: '5',
      forwardSeconds: '5',
      shouldOverrideKeys: false,
      shouldOverrideArrowKeys: true,
      shouldOverrideMediaKeys: false,
      shouldShowButtonsTooltip: true,
    };

    const result3 = handleOverrideKeysMigration(defaultOptions, storageOptions);

    expect(result3).toBe(true);

    storageOptions = {
      rewindSeconds: '5',
      forwardSeconds: '5',
      shouldOverrideKeys: false,
      shouldOverrideArrowKeys: false,
      shouldOverrideMediaKeys: true,
      shouldShowButtonsTooltip: true,
    };

    const result4 = handleOverrideKeysMigration(defaultOptions, storageOptions);

    expect(result4).toBe(false);
  });
});
