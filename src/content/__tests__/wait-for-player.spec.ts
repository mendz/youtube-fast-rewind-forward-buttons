import {
  waitForPlayerElements,
  abortWait,
  bindWaitCleanup,
  resetWaitState,
} from '../wait-for-player';
import {
  HTML_PLAYER_READY,
  HTML_PLAYER_VIDEO_ONLY,
  HTML_PLAYER_PLAY_BUTTON_ONLY,
  HTML_PLAYER_CONTROLS_NO_ANCHOR,
  HTML_MINIMAL_NO_PLAYER,
  INITIAL_HTML_PLAYER_FULL,
} from '../__utils__/tests-helper';

describe('waitForPlayerElements', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    resetWaitState();
    rafCallbacks = [];
    rafId = 0;

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return ++rafId;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('when elements exist immediately', () => {
    it('should resolve immediately with player elements', async () => {
      document.body.innerHTML = HTML_PLAYER_READY;

      const promise = waitForPlayerElements();
      const result = await promise;

      expect(result).not.toBeNull();
      expect(result?.video).toBeInstanceOf(HTMLVideoElement);
      expect(result?.video.src).toContain('test');
      expect(result?.controls).toBeDefined();
      expect(result?.anchorButton).toBeDefined();
    });

    it('should return video element with correct selector', async () => {
      document.body.innerHTML = HTML_PLAYER_READY;

      const result = await waitForPlayerElements();

      expect(result?.video.classList.contains('video-stream')).toBe(true);
      expect(result?.video.classList.contains('html5-main-video')).toBe(true);
    });

    it('should return controls element', async () => {
      document.body.innerHTML = HTML_PLAYER_READY;

      const result = await waitForPlayerElements();

      expect(result?.controls.classList.contains('ytp-left-controls')).toBe(
        true
      );
    });

    it('should return next button as anchor when available', async () => {
      document.body.innerHTML = HTML_PLAYER_READY;

      const result = await waitForPlayerElements();

      expect(result?.anchorButton.classList.contains('ytp-next-button')).toBe(
        true
      );
    });
  });

  describe('when elements appear after retries', () => {
    it('should resolve when elements appear within retry limit', async () => {
      document.body.innerHTML = INITIAL_HTML_PLAYER_FULL;

      const promise = waitForPlayerElements({ maxRetries: 10 });

      // First few checks should not find elements
      flushRAF(3, rafCallbacks);

      // Add video element
      const videoContainer = document.querySelector('.html5-video-container');
      const video = document.createElement('video');
      video.classList.add('video-stream', 'html5-main-video');
      video.src = 'test.mp4';
      videoContainer?.appendChild(video);

      // Next check should find elements
      flushRAF(1, rafCallbacks);

      const result = await promise;
      expect(result).not.toBeNull();
      expect(result?.video.src).toContain('test.mp4');
    });

    it('should call onRetry callback on each retry', async () => {
      document.body.innerHTML = INITIAL_HTML_PLAYER_FULL;
      const onRetry = jest.fn();

      const promise = waitForPlayerElements({ maxRetries: 5, onRetry });

      // Flush 4 retries (first check + 4 retries before max)
      flushRAF(5, rafCallbacks);

      await promise;

      // onRetry is called for each retry attempt (not the initial check)
      expect(onRetry).toHaveBeenCalledTimes(4);
    });
  });

  describe('when elements never appear', () => {
    it('should return null after max retries', async () => {
      document.body.innerHTML = HTML_MINIMAL_NO_PLAYER;
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const promise = waitForPlayerElements({ maxRetries: 5 });

      // Flush all retries
      flushRAF(5, rafCallbacks);

      const result = await promise;

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Max retries reached waiting for player elements'
      );

      consoleWarnSpy.mockRestore();
    });

    it('should use default max retries when not specified', async () => {
      document.body.innerHTML = HTML_MINIMAL_NO_PLAYER;
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const promise = waitForPlayerElements();

      // Flush 600 retries (default ~10s at 60fps)
      flushRAF(600, rafCallbacks);

      const result = await promise;
      expect(result).toBeNull();
    });
  });

  describe('when video has no src', () => {
    it('should not resolve until video has src', async () => {
      document.body.innerHTML = HTML_PLAYER_READY;
      const video = document.querySelector('video');
      if (video) video.src = '';

      const promise = waitForPlayerElements({ maxRetries: 10 });

      // First checks should not find elements (no src)
      flushRAF(3, rafCallbacks);

      // Add src to video
      if (video) video.src = 'test.mp4';

      // Next check should find elements
      flushRAF(1, rafCallbacks);

      const result = await promise;
      expect(result).not.toBeNull();
    });
  });

  describe('when controls are missing', () => {
    it('should return null if controls never appear', async () => {
      document.body.innerHTML = HTML_PLAYER_VIDEO_ONLY;
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const promise = waitForPlayerElements({ maxRetries: 5 });
      flushRAF(5, rafCallbacks);

      const result = await promise;
      expect(result).toBeNull();
    });
  });

  describe('when anchor button is missing', () => {
    it('should use play button as anchor when next button is missing', async () => {
      document.body.innerHTML = HTML_PLAYER_PLAY_BUTTON_ONLY;

      const result = await waitForPlayerElements();

      expect(result).not.toBeNull();
      expect(result?.anchorButton.classList.contains('ytp-play-button')).toBe(
        true
      );
    });

    it('should return null if no anchor button exists', async () => {
      document.body.innerHTML = HTML_PLAYER_CONTROLS_NO_ANCHOR;
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const promise = waitForPlayerElements({ maxRetries: 5 });
      flushRAF(5, rafCallbacks);

      const result = await promise;
      expect(result).toBeNull();
    });
  });
});

describe('abortWait', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    resetWaitState();
    rafCallbacks = [];
    rafId = 0;

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return ++rafId;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should abort pending wait and return null', async () => {
    document.body.innerHTML = INITIAL_HTML_PLAYER_FULL;

    const promise = waitForPlayerElements({ maxRetries: 100 });

    // Start some retries
    flushRAF(2, rafCallbacks);

    // Abort the wait
    abortWait();

    // Flush one more to process the abort
    flushRAF(1, rafCallbacks);

    const result = await promise;
    expect(result).toBeNull();
  });

  it('should not affect subsequent wait calls after reset', async () => {
    document.body.innerHTML = HTML_PLAYER_READY;

    // First wait - abort it
    abortWait();
    resetWaitState();

    // Second wait should work normally
    const result = await waitForPlayerElements();
    expect(result).not.toBeNull();
  });

  it('should invalidate the first wait when a second wait starts', async () => {
    document.body.innerHTML = INITIAL_HTML_PLAYER_FULL;

    // Start a first wait that will keep polling
    const firstPromise = waitForPlayerElements({ maxRetries: 100 });

    // Flush a couple of RAF cycles so the first wait is mid-poll
    flushRAF(2, rafCallbacks);

    // Start a second wait — this increments the generation and
    // should cause the first wait to resolve null on its next check
    document.body.innerHTML = HTML_PLAYER_READY;
    const secondPromise = waitForPlayerElements();

    // Flush one more so the first wait's pending RAF fires and sees stale generation
    flushRAF(1, rafCallbacks);

    const firstResult = await firstPromise;
    const secondResult = await secondPromise;

    expect(firstResult).toBeNull();
    expect(secondResult).not.toBeNull();
    expect(secondResult?.video).toBeInstanceOf(HTMLVideoElement);
  });
});

describe('bindWaitCleanup', () => {
  beforeEach(() => {
    resetWaitState();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should add pagehide event listener', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    bindWaitCleanup();

    expect(addEventListenerSpy).toHaveBeenCalledWith('pagehide', abortWait);
  });

  it('should add beforeunload event listener', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    bindWaitCleanup();

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', abortWait);
  });

  it('should only bind once per page lifecycle', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    bindWaitCleanup();
    bindWaitCleanup();
    bindWaitCleanup();

    // Should only be called twice (pagehide and beforeunload) total
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
  });
});

describe('resetWaitState', () => {
  beforeEach(() => {
    resetWaitState();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should allow bindWaitCleanup to bind again', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    bindWaitCleanup();
    resetWaitState();
    bindWaitCleanup();

    // Should be called 4 times total (2 + 2)
    expect(addEventListenerSpy).toHaveBeenCalledTimes(4);
  });
});

// Helper to flush RAF callbacks (clears array in place so mock and helper share state)
function flushRAF(count = 1, rafCallbacks: FrameRequestCallback[]): void {
  for (let i = 0; i < count; i++) {
    const callbacks = [...rafCallbacks];
    rafCallbacks.length = 0;
    callbacks.forEach((cb) => cb(performance.now()));
  }
}
