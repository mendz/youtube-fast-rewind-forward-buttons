import { chrome } from 'jest-chrome';
import * as buttons from '../buttons';
import * as eventKeys from '../event-keys';
import { run, loadOptions, updateButtonAfterNewStorage } from '../content';
import {
  DEFAULT_OPTIONS_MOCK,
  HTML_PLAYER_FULL,
} from '../__utils__/tests-helper';
import { ButtonClassesIds } from '../types';

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
    const event = new KeyboardEvent('keydown', { keyCode: 37 });
    document.dispatchEvent(event);
    expect(overrideArrowKeysSpy).toBeCalledTimes(1); // TODO: continue to look over of how to clear the document listeners, it called 4 times because of the 4 run() if this test placed in the end
    overrideArrowKeysSpy.mockClear();
    overrideArrowKeysSpy.mockReset();
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
});

describe('loadOptions', () => {
  const originalConsoleError = console.error;

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('Should return the values from the storage if exists', async () => {
    const options = {
      rewindSeconds: 10,
      forwardSeconds: 2,
      shouldOverrideKeys: true,
    };
    chrome.storage.sync.get.mockReturnValue(options as any);
    const loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject(options);
  });

  it(`Should return the default value from if the on storage doesn't exists`, async () => {
    const options = {
      rewindSeconds: 10,
      shouldOverrideKeys: true,
    };
    chrome.storage.sync.get.mockReturnValue({ ...options } as any);
    let loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject({
      ...options,
      forwardSeconds: DEFAULT_OPTIONS_MOCK.forwardSeconds,
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
      shouldOverrideKeys: DEFAULT_OPTIONS_MOCK.shouldOverrideKeys,
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

describe('updateButtonAfterNewStorage', () => {
  it('Should return the merge options', () => {
    const optionsMock = {
      forwardSeconds: 2,
      rewindSeconds: 7,
      shouldOverrideKeys: true,
    };
    const changeOptionsMock: { [key: string]: chrome.storage.StorageChange } = {
      rewindSeconds: {
        oldValue: optionsMock.rewindSeconds,
        newValue: DEFAULT_OPTIONS_MOCK.rewindSeconds,
      },
      shouldOverrideKeys: {
        oldValue: optionsMock.shouldOverrideKeys,
        newValue: DEFAULT_OPTIONS_MOCK.shouldOverrideKeys,
      },
    };
    const video = document.querySelector('video') as HTMLVideoElement;
    const returnedOptions = updateButtonAfterNewStorage(
      changeOptionsMock,
      optionsMock,
      video
    );

    const returnValueToTest = {
      ...DEFAULT_OPTIONS_MOCK,
      forwardSeconds: optionsMock.forwardSeconds,
    };
    expect(returnedOptions).toMatchObject(returnValueToTest);
  });

  it('Should handle unsparing number', () => {
    const optionsMock = {
      forwardSeconds: 2,
      rewindSeconds: 7,
      shouldOverrideKeys: true,
    };
    const changeOptionsMock: { [key: string]: chrome.storage.StorageChange } = {
      rewindSeconds: {
        oldValue: optionsMock.rewindSeconds,
        newValue: DEFAULT_OPTIONS_MOCK.rewindSeconds,
      },
      forwardSeconds: {
        oldValue: optionsMock.forwardSeconds,
        newValue: '|',
      },
      shouldOverrideKeys: {
        oldValue: optionsMock.shouldOverrideKeys,
        newValue: DEFAULT_OPTIONS_MOCK.shouldOverrideKeys,
      },
    };
    const video = document.querySelector('video') as HTMLVideoElement;
    const returnedOptions = updateButtonAfterNewStorage(
      changeOptionsMock,
      optionsMock,
      video
    );

    const returnValueToTest = {
      ...DEFAULT_OPTIONS_MOCK,
      forwardSeconds: optionsMock.forwardSeconds,
    };
    expect(returnedOptions).toMatchObject(returnValueToTest);
  });
});
