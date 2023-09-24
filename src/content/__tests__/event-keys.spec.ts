import {
  isShouldSkipOverrideArrowKeys,
  overrideArrowKeys,
  overrideMediaKeys,
  simulateKey,
} from '../event-keys';
import { ArrowKey, KEY_CODES, MediaTrackKey } from '../types';
import {
  DEFAULT_OPTIONS_MOCK,
  HTML_PLAYER_FULL,
} from '../__utils__/tests-helper';
import * as handleVideoPlayer from '../handle-video-player';

describe('simulateKey', () => {
  const leftKeyEvent = new KeyboardEvent('keydown', {
    key: ArrowKey.ARROW_LEFT_KEY,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
    which: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
  });
  const rightKeyEvent = new KeyboardEvent('keydown', {
    key: ArrowKey.ARROW_LEFT_KEY,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
    which: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
  });
  const originalBody = document.body;
  afterAll(() => {
    document.body = originalBody;
  });

  it('should dispatch the correct keyboard event ', () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    const body = document.querySelector('body') ?? { dispatchEvent: null };
    const originalBodyDispatchEvent = body.dispatchEvent;

    body.dispatchEvent = jest.fn();
    simulateKey(ArrowKey.ARROW_LEFT_KEY);
    expect(body.dispatchEvent).toHaveBeenCalledWith(leftKeyEvent);
    simulateKey(ArrowKey.ARROW_RIGHT_KEY);
    expect(body.dispatchEvent).toHaveBeenCalledWith(rightKeyEvent);
    body.dispatchEvent = originalBodyDispatchEvent;
  });
  it('should console error when there is no body', () => {
    document.querySelector('body')?.remove();
    const originalConsoleError = console.error;
    console.error = jest.fn();
    simulateKey('test' as ArrowKey);
    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toHaveBeenLastCalledWith(
      `simulateKey failed, couldn't find body`
    );
    console.error = originalConsoleError;
  });
});

describe('isShouldSkipOverrideKeys', () => {
  it('should return true when not the correct key', () => {
    const result: boolean = isShouldSkipOverrideArrowKeys(
      'mendy' as any,
      DEFAULT_OPTIONS_MOCK
    );
    expect(result).toBe(true);
  });
  it('should return true when not shouldOverrideKeys', () => {
    const result: boolean = isShouldSkipOverrideArrowKeys(
      ArrowKey.ARROW_LEFT_KEY,
      DEFAULT_OPTIONS_MOCK
    );
    expect(result).toBe(true);
  });
  it('should return true when the correct key but 5 seconds even should overrideArrowKeys', () => {
    const newOptions = {
      ...DEFAULT_OPTIONS_MOCK,
      shouldOverrideKeys: true,
    };
    let result: boolean = isShouldSkipOverrideArrowKeys(
      ArrowKey.ARROW_LEFT_KEY,
      newOptions
    );
    expect(result).toBe(true);
    result = isShouldSkipOverrideArrowKeys(
      ArrowKey.ARROW_RIGHT_KEY,
      newOptions
    );
    expect(result).toBe(true);
  });
  it('should return false when the correct key but NOT 5 seconds and shouldOverrideArrowKeys', () => {
    const newOptions = {
      ...DEFAULT_OPTIONS_MOCK,
      shouldOverrideArrowKeys: true,
      rewindSeconds: 10,
    };
    let result: boolean = isShouldSkipOverrideArrowKeys(
      ArrowKey.ARROW_LEFT_KEY,
      newOptions
    );
    expect(result).toBe(false);
    newOptions.forwardSeconds = 10;
    result = isShouldSkipOverrideArrowKeys(
      ArrowKey.ARROW_RIGHT_KEY,
      newOptions
    );
    expect(result).toBe(false);
  });
});

describe('overrideArrowKeys', () => {
  const videoElement = document.createElement('video');
  const key = ArrowKey.ARROW_LEFT_KEY;
  const event: KeyboardEvent = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: KEY_CODES[key],
    which: KEY_CODES[key],
  });
  let updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');

  beforeEach(async () => {
    updateVideoTimeSpy.mockClear();
    event.preventDefault = jest.fn();
    updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');
  });

  afterEach(() => {
    updateVideoTimeSpy.mockReset();
  });

  it('Should not skip override and run updateVideoTime', () => {
    overrideArrowKeys(
      event,
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideArrowKeys: true,
        rewindSeconds: 10,
      },
      videoElement
    );
    expect(event.preventDefault).toHaveBeenCalled();
    expect(updateVideoTimeSpy).toHaveBeenCalledWith({
      seconds: 10,
      video: videoElement,
      updateType: key,
    });
  });
  it('Should skip override and not run updateVideoTime when options.shouldOverrideKeys is false', () => {
    overrideArrowKeys(
      event,
      { ...DEFAULT_OPTIONS_MOCK, shouldOverrideKeys: false, rewindSeconds: 10 },
      videoElement
    );
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(updateVideoTimeSpy).not.toHaveBeenCalled();
  });
  it('Should skip override and not run updateVideoTime when options.shouldOverrideKeys is true but the seconds are 5', () => {
    overrideArrowKeys(
      event,
      { ...DEFAULT_OPTIONS_MOCK, shouldOverrideKeys: true, rewindSeconds: 5 },
      videoElement
    );
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(updateVideoTimeSpy).not.toHaveBeenCalled();
  });
});

describe('overrideMediaKeys', () => {
  const videoElement = document.createElement('video');
  let updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');
  let originalBodyDispatchEvent: ((event: Event) => boolean) | null;
  let body: HTMLBodyElement | { dispatchEvent: null };

  function generateEvent(key: MediaTrackKey | ArrowKey) {
    return new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      composed: true,
      keyCode: KEY_CODES[key],
      which: KEY_CODES[key],
    });
  }

  beforeEach(async () => {
    updateVideoTimeSpy.mockClear();
    updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');

    document.body.innerHTML = HTML_PLAYER_FULL;
    body = document.querySelector('body') ?? { dispatchEvent: null };
    originalBodyDispatchEvent = body.dispatchEvent;
    body.dispatchEvent = jest.fn();
  });

  afterEach(() => {
    updateVideoTimeSpy.mockReset();
    body.dispatchEvent = originalBodyDispatchEvent;
  });

  it('Should not skip and dispatch the key event when options rewindSeconds are 5 and ARROW_LEFT_KEY', () => {
    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_PREVIOUS),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: true,
      },
      videoElement
    );

    const leftKeyEvent = generateEvent(ArrowKey.ARROW_LEFT_KEY);

    expect(body.dispatchEvent).toHaveBeenCalledWith(leftKeyEvent);

    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_PREVIOUS),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: true,
        forwardSeconds: 10,
      },
      videoElement
    );

    expect(body.dispatchEvent).toHaveBeenCalledWith(leftKeyEvent);
  });

  it('Should not skip and run simulateKey when options forwardSeconds are 5 and ARROW_RIGHT_KEY', () => {
    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_NEXT),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: true,
      },
      videoElement
    );

    const rightKeyEvent = generateEvent(ArrowKey.ARROW_RIGHT_KEY);

    expect(body.dispatchEvent).toHaveBeenCalledWith(rightKeyEvent);

    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_NEXT),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: true,
        rewindSeconds: 10,
      },
      videoElement
    );

    expect(body.dispatchEvent).toHaveBeenCalledWith(rightKeyEvent);
  });

  it('Should not skip and run updateVideoTime', () => {
    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_PREVIOUS),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: true,
        rewindSeconds: 10,
      },
      videoElement
    );

    expect(updateVideoTimeSpy).toHaveBeenCalledWith({
      seconds: 10,
      video: videoElement,
      updateType: ArrowKey.ARROW_LEFT_KEY,
    });

    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_NEXT),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: true,
        forwardSeconds: 10,
      },
      videoElement
    );

    expect(updateVideoTimeSpy).toHaveBeenCalledWith({
      seconds: 10,
      video: videoElement,
      updateType: ArrowKey.ARROW_RIGHT_KEY,
    });
  });

  it('Should not skip and run preventDefault', () => {
    const event = generateEvent(MediaTrackKey.MEDIA_TRACK_PREVIOUS);
    event.preventDefault = jest.fn();
    overrideMediaKeys(
      event,
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: true,
        rewindSeconds: 10,
      },
      videoElement
    );
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('Should skip override and not run updateVideoTime && simulateKey when options.shouldOverrideMediaKeys is false', () => {
    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_PREVIOUS),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: false,
      },
      videoElement
    );

    expect(body.dispatchEvent).not.toHaveBeenCalledWith(
      generateEvent(ArrowKey.ARROW_LEFT_KEY)
    );

    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_NEXT),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: false,
      },
      videoElement
    );

    expect(body.dispatchEvent).not.toHaveBeenCalledWith(
      generateEvent(ArrowKey.ARROW_RIGHT_KEY)
    );

    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_PREVIOUS),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: false,
        rewindSeconds: 10,
      },
      videoElement
    );

    expect(updateVideoTimeSpy).not.toHaveBeenCalled();

    overrideMediaKeys(
      generateEvent(MediaTrackKey.MEDIA_TRACK_NEXT),
      {
        ...DEFAULT_OPTIONS_MOCK,
        shouldOverrideMediaKeys: false,
        forwardSeconds: 10,
      },
      videoElement
    );

    expect(updateVideoTimeSpy).not.toHaveBeenCalled();
  });
});
