import { chrome } from 'jest-chrome';
import { run, loadOptions } from '../content';
import { updateVideoTime } from '../handle-video-player';
import { ArrowKey } from '../types';
import {
  DEFAULT_OPTIONS_MOCK,
  HTML_PLAYER_FULL,
} from '../__utils__/tests-helper';

describe('full run', () => {
  it('should have 2 buttons', async () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    await run();
    expect(
      document.querySelectorAll('button.ml-custom-rewind-forward-buttons')
        ?.length
    ).toEqual(2);
  });
  it('should have no button when there is no video', async () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    document.querySelector('video')?.remove();
    await run();
    expect(
      document.querySelectorAll('button.ml-custom-rewind-forward-buttons')
        ?.length
    ).toEqual(0);
  });
});

describe('updateVideoTime', () => {
  const videoElement = document.createElement('video');
  it('should reduce to the currentTime video when ARROW_LEFT_KEY', () => {
    videoElement.currentTime = 100;
    updateVideoTime({
      seconds: 30,
      video: videoElement,
      updateType: ArrowKey.ARROW_LEFT_KEY,
    });
    expect(videoElement.currentTime).toBe(70);
  });
  it('should add to the currentTime video when ARROW_RIGHT_KEY', () => {
    videoElement.currentTime = 100;
    updateVideoTime({
      seconds: 30,
      video: videoElement,
      updateType: ArrowKey.ARROW_RIGHT_KEY,
    });
    expect(videoElement.currentTime).toBe(130);
  });
  it('should do nothing to the currentTime video when no arrow', () => {
    videoElement.currentTime = 100;
    updateVideoTime({
      seconds: 30,
      video: videoElement,
      updateType: 'test_key' as any,
    });
    expect(videoElement.currentTime).toBe(100);
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
