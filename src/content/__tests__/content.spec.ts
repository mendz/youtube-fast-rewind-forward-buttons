import { chrome } from 'jest-chrome';
import * as buttons from '../buttons';
import * as eventKeys from '../event-keys';
import { run, loadOptions, updateButtonAfterNewStorage } from '../content';
import { ButtonClassesIds } from '../types';
import {
  DEFAULT_OPTIONS_MOCK,
  HTML_PLAYER_FULL,
} from '../__utils__/tests-helper';

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
    await run();
    expect(console.error).toBeCalledWith(errorMessage);
  });

  it('Should pass to getButtons the correct svg parts depends what in the page', async () => {
    // set all the mockups
    const video = document.querySelector('video');
    chrome.storage.sync.get.mockReturnValue(DEFAULT_OPTIONS_MOCK as any);
    const getButtonsSpy = jest.spyOn(buttons, 'getButtons');
    // clear the dom from the svg parts
    document.querySelector('svg path')?.classList.remove('ytp-svg-fill');
    document.querySelector('svg use')?.remove();

    await run();
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
    await run();
    expect(getButtonsSpy).toBeCalledWith(DEFAULT_OPTIONS_MOCK, video, {
      svgClasses: ['test-class'],
      svgPathClasses: ['ytp-svg-fill'],
      svgUseHtml: '<use></use>',
    });
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
  it('Should call updateButtonsTitles and return the merge options', () => {
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
    const updateButtonsSpy = jest.spyOn(buttons, 'updateButtonsTitles');
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
    expect(updateButtonsSpy).toBeCalledWith(returnValueToTest);
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
    const updateButtonsSpy = jest.spyOn(buttons, 'updateButtonsTitles');
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
    expect(updateButtonsSpy).toBeCalledWith(returnValueToTest);
    expect(returnedOptions).toMatchObject(returnValueToTest);
  });
});
