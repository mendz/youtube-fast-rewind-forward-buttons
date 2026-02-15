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
import * as waitForPlayer from '../wait-for-player';

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

describe('chrome.storage.onChanged listener', () => {
  beforeEach(() => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    console.error = jest.fn();
  });

  it('should load full options from storage when loadedOptions is not yet set', async () => {
    content.clearLoadedOptions();
    chrome.storage.sync.get.mockReturnValue(DEFAULT_OPTIONS_MOCK as any);

    const changes: ChromeStorageChanges = {
      rewindSeconds: { oldValue: 5, newValue: 10 },
    };
    chrome.storage.onChanged.callListeners(changes, 'sync');

    // Flush the async loadOptions() call inside the listener
    await Promise.resolve();
    await Promise.resolve();

    expect(chrome.storage.sync.get).toHaveBeenCalled();
  });

  it('should not call updateButtons when no video element exists', async () => {
    await run();
    document.querySelector(YouTubeSelectors.Player.VIDEO)?.remove();
    const updateButtonsSpy = jest.spyOn(buttons, 'updateButtons');

    const changes: ChromeStorageChanges = {
      rewindSeconds: { oldValue: 5, newValue: 10 },
    };
    chrome.storage.onChanged.callListeners(changes, 'sync');

    // Flush microtasks for the async listener
    await Promise.resolve();

    expect(updateButtonsSpy).not.toHaveBeenCalled();
    updateButtonsSpy.mockRestore();
  });

  it('should update loadedOptions even when no video element exists', async () => {
    await run();
    document.querySelector(YouTubeSelectors.Player.VIDEO)?.remove();
    const updateButtonsSpy = jest.spyOn(buttons, 'updateButtons');

    const changes: ChromeStorageChanges = {
      rewindSeconds: { oldValue: 5, newValue: 42 },
    };
    chrome.storage.onChanged.callListeners(changes, 'sync');

    // Flush microtasks for the async listener
    await Promise.resolve();

    // updateButtons should NOT be called (no video)
    expect(updateButtonsSpy).not.toHaveBeenCalled();

    // But options should have been updated in memory.
    // Verify by restoring the video and triggering another change --
    // the previous rewindSeconds=42 should be the base for the merge.
    document.body.innerHTML = HTML_PLAYER_FULL;
    const changes2: ChromeStorageChanges = {
      forwardSeconds: { oldValue: 5, newValue: 99 },
    };
    chrome.storage.onChanged.callListeners(changes2, 'sync');
    await Promise.resolve();

    expect(updateButtonsSpy).toHaveBeenCalledTimes(1);
    const calledOptions = updateButtonsSpy.mock.calls[0][0] as IOptions;
    // rewindSeconds should be 42 from the first (no-video) update
    expect(calledOptions.rewindSeconds).toBe(42);
    expect(calledOptions.forwardSeconds).toBe(99);

    updateButtonsSpy.mockRestore();
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

describe('SPA Navigation Handling', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    jest.useFakeTimers();
    content.resetNavState();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Ensure cleanup before resetting timers
    content.cleanupFallback();
    content.resetNavState();
    jest.clearAllTimers();
    jest.useRealTimers();
    consoleWarnSpy.mockRestore();
  });

  describe('hasVideoAndButtons', () => {
    it('should return true when video with src and custom buttons exist', async () => {
      jest.useRealTimers();
      await run();
      expect(content.hasVideoAndButtons()).toBe(true);
    });

    it('should return false when no video exists', () => {
      document.body.innerHTML = '<div></div>';
      expect(content.hasVideoAndButtons()).toBe(false);
    });

    it('should return false when video has no src', () => {
      const video = document.querySelector(
        YouTubeSelectors.Player.VIDEO
      ) as HTMLVideoElement;
      video.src = '';
      expect(content.hasVideoAndButtons()).toBe(false);
    });

    it('should return false when custom buttons are missing', () => {
      expect(content.hasVideoAndButtons()).toBe(false);
    });
  });

  describe('isPlayerReady', () => {
    it('should return true when video with src and controls with next button exist', () => {
      // HTML_PLAYER_FULL has video with src + left controls + next button
      expect(content.isPlayerReady()).toBe(true);
    });

    it('should return true when video with src and controls with play button exist (no next button)', () => {
      // Remove the next button but keep a play button
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

      expect(content.isPlayerReady()).toBe(true);
    });

    it('should return false when no video exists', () => {
      document.body.innerHTML = '<div></div>';
      expect(content.isPlayerReady()).toBe(false);
    });

    it('should return false when video has no src', () => {
      const video = document.querySelector(
        YouTubeSelectors.Player.VIDEO
      ) as HTMLVideoElement;
      // Use removeAttribute because JSDOM resolves video.src = '' to the base URL
      video.removeAttribute('src');
      expect(content.isPlayerReady()).toBe(false);
    });

    it('should return false when controls are missing', () => {
      document.querySelector(YouTubeSelectors.Player.CONTROLS_LEFT)?.remove();
      expect(content.isPlayerReady()).toBe(false);
    });

    it('should return false when neither next nor play button exists', () => {
      document
        .querySelector(
          `${YouTubeSelectors.Player.CONTROLS_LEFT} ${YouTubeSelectors.Player.NEXT_BUTTON}`
        )
        ?.remove();
      expect(content.isPlayerReady()).toBe(false);
    });

    it('should return true even when custom buttons do not exist yet', () => {
      // This is the key difference from hasVideoAndButtons():
      // isPlayerReady should return true when the player is ready for
      // button injection, even though buttons haven't been created yet.
      expect(content.hasVideoAndButtons()).toBe(false); // no custom buttons
      expect(content.isPlayerReady()).toBe(true); // player is ready
    });
  });

  describe('handleSpaNavigation pending guard', () => {
    it('should prevent double-fires when called multiple times rapidly', () => {
      // Call handleSpaNavigation twice rapidly
      content.handleSpaNavigation();

      // Check that isInitPending is true after first call
      expect(content.getNavState().isInitPending).toBe(true);

      // Second call should be blocked by pending guard
      content.handleSpaNavigation();

      // Still only one timer should be set (first call's timer)
      expect(content.getNavState().navFallbackTimer).not.toBeNull();
    });

    it('should allow new init after previous completes', async () => {
      jest.useRealTimers();

      // First navigation
      content.handleSpaNavigation();
      expect(content.getNavState().isInitPending).toBe(true);

      // Wait for initializeExtension to fully complete (uses waitForPlayerElements internally)
      // Give it enough time for all async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(content.getNavState().isInitPending).toBe(false);

      // Second navigation should be allowed
      content.handleSpaNavigation();
      expect(content.getNavState().isInitPending).toBe(true);
    });

    it('should not start a second init when startInitialization is called directly while pending', () => {
      const pendingInit = new Promise<void>(() => {});
      const initSpy = jest
        .spyOn(content, 'initializeExtension')
        .mockReturnValue(pendingInit);

      content.startInitialization();
      expect(content.getNavState().isInitPending).toBe(true);

      // Direct startInitialization should still be guarded
      content.startInitialization();
      expect(initSpy).toHaveBeenCalledTimes(1);

      initSpy.mockRestore();
    });

    it('should reset isInitPending so a new init can start after SPA navigation during a pending init', () => {
      const pendingInit = new Promise<void>(() => {});
      const initSpy = jest
        .spyOn(content, 'initializeExtension')
        .mockReturnValue(pendingInit);

      // First init sets isInitPending = true
      content.startInitialization();
      expect(content.getNavState().isInitPending).toBe(true);

      // SPA navigation should reset isInitPending and allow a new init
      content.handleSpaNavigation();

      // initializeExtension should be called again (once from startInitialization, once from handleSpaNavigation)
      expect(initSpy).toHaveBeenCalledTimes(2);

      initSpy.mockRestore();
    });

    it('should disconnect videoSrcObserver when a second SPA navigation fires', () => {
      const originalMutationObserver = global.MutationObserver;
      const observerInstances: Array<{
        observe: jest.Mock;
        disconnect: jest.Mock;
      }> = [];

      const MutationObserverMock = jest.fn().mockImplementation(() => {
        const instance = {
          observe: jest.fn(),
          disconnect: jest.fn(),
        };
        observerInstances.push(instance);
        return instance;
      });

      Object.defineProperty(global, 'MutationObserver', {
        configurable: true,
        writable: true,
        value: MutationObserverMock,
      });

      try {
        document.body.innerHTML = HTML_PLAYER_FULL;

        // Set up a src observer (simulating a completed first navigation)
        content.observeVideoSrcChange();
        expect(observerInstances.length).toBe(1);
        const firstSrcObserver = observerInstances[0];

        // SPA navigation should disconnect the existing src observer
        content.handleSpaNavigation();
        expect(firstSrcObserver.disconnect).toHaveBeenCalled();
      } finally {
        Object.defineProperty(global, 'MutationObserver', {
          configurable: true,
          writable: true,
          value: originalMutationObserver,
        });
      }
    });

    it('should abort pending waitForPlayerElements when SPA navigation fires', () => {
      const abortWaitSpy = jest.spyOn(waitForPlayer, 'abortWait');

      content.handleSpaNavigation();

      expect(abortWaitSpy).toHaveBeenCalled();

      abortWaitSpy.mockRestore();
    });
  });

  describe('handleSpaNavigation fallback mechanism', () => {
    it('should set up fallback timer on navigation', () => {
      content.handleSpaNavigation();

      const state = content.getNavState();
      expect(state.navFallbackTimer).not.toBeNull();
    });

    it('should clear existing fallback timer when new navigation occurs', async () => {
      jest.useRealTimers();

      content.handleSpaNavigation();
      const firstTimer = content.getNavState().navFallbackTimer;
      expect(firstTimer).not.toBeNull();

      // Wait for init to complete so we can call again
      await Promise.resolve();
      await Promise.resolve();

      content.handleSpaNavigation();
      const secondTimer = content.getNavState().navFallbackTimer;

      // Should have a new timer (old one was cleared and replaced)
      expect(secondTimer).not.toBeNull();
    });

    it('should start MutationObserver if video/buttons not found after timeout', () => {
      // Remove video so hasVideoAndButtons returns false
      document.body.innerHTML = '<div></div>';

      content.handleSpaNavigation();

      // Fast-forward past the 2-second fallback timer
      jest.advanceTimersByTime(2100);

      const state = content.getNavState();
      expect(state.fallbackObserver).not.toBeNull();

      // Clean up observer before test ends
      content.cleanupFallback();
    });

    it('should not start MutationObserver if video/buttons are found', async () => {
      jest.useRealTimers();
      // Ensure video and buttons exist
      await run();

      jest.useFakeTimers();

      content.handleSpaNavigation();

      // Fast-forward past the 2-second fallback timer
      jest.advanceTimersByTime(2100);

      const state = content.getNavState();
      expect(state.fallbackObserver).toBeNull();
    });

    it('should call run() and observeVideoSrcChange() when player appears even without pre-existing buttons (no deadlock)', async () => {
      // beforeEach already sets fake timers and resets nav state

      // Start with an empty DOM — no player at all
      document.body.innerHTML = '<div id="page"></div>';

      content.handleSpaNavigation();

      // Advance past the 2-second fallback timer
      jest.advanceTimersByTime(2100);

      // Observer should now be active (player wasn't found)
      expect(content.getNavState().fallbackObserver).not.toBeNull();

      // Spy on run before injecting player elements
      const runSpy = jest.spyOn(content, 'run');
      const observeSpy = jest.spyOn(content, 'observeVideoSrcChange');

      // Inject a full player into the DOM — this triggers the MutationObserver.
      // Importantly, no custom buttons exist yet. With the fix, isPlayerReady()
      // detects the player without requiring pre-existing buttons.
      document.getElementById('page')!.innerHTML = HTML_PLAYER_FULL;

      // Flush microtasks so the MutationObserver callback fires
      await Promise.resolve();
      await Promise.resolve();

      // The observer should have detected the player and called run()
      expect(runSpy).toHaveBeenCalled();
      expect(observeSpy).toHaveBeenCalled();

      // And the observer should have disconnected itself
      expect(content.getNavState().fallbackObserver).toBeNull();

      runSpy.mockRestore();
      observeSpy.mockRestore();
    });
  });

  describe('observeVideoSrcChange deduplication', () => {
    it('should disconnect previous src observer before creating a new one', () => {
      const originalMutationObserver = global.MutationObserver;
      const observerInstances: Array<{
        observe: jest.Mock;
        disconnect: jest.Mock;
      }> = [];

      const MutationObserverMock = jest.fn().mockImplementation(() => {
        const instance = {
          observe: jest.fn(),
          disconnect: jest.fn(),
        };
        observerInstances.push(instance);
        return instance;
      });

      Object.defineProperty(global, 'MutationObserver', {
        configurable: true,
        writable: true,
        value: MutationObserverMock,
      });

      try {
        document.body.innerHTML = HTML_PLAYER_FULL;
        content.observeVideoSrcChange();
        content.observeVideoSrcChange();

        expect(observerInstances.length).toBe(2);
        expect(observerInstances[0].disconnect).toHaveBeenCalledTimes(1);
        expect(observerInstances[1].observe).toHaveBeenCalledTimes(1);
      } finally {
        Object.defineProperty(global, 'MutationObserver', {
          configurable: true,
          writable: true,
          value: originalMutationObserver,
        });
      }
    });
  });

  describe('observeVideoSrcChange debounce', () => {
    let observerCallback: MutationCallback;
    let originalMutationObserver: typeof MutationObserver;

    beforeEach(() => {
      originalMutationObserver = global.MutationObserver;

      const MutationObserverMock = jest
        .fn()
        .mockImplementation((cb: MutationCallback) => {
          observerCallback = cb;
          return {
            observe: jest.fn(),
            disconnect: jest.fn(),
          };
        });

      Object.defineProperty(global, 'MutationObserver', {
        configurable: true,
        writable: true,
        value: MutationObserverMock,
      });

      document.body.innerHTML = HTML_PLAYER_FULL;
    });

    afterEach(() => {
      Object.defineProperty(global, 'MutationObserver', {
        configurable: true,
        writable: true,
        value: originalMutationObserver,
      });
    });

    it('should debounce multiple rapid src mutations into a single run() call', () => {
      const runSpy = jest.spyOn(content, 'run').mockResolvedValue();

      content.observeVideoSrcChange();

      const srcMutation = {
        type: 'attributes',
        attributeName: 'src',
      } as unknown as MutationRecord;

      // Fire 5 rapid src mutations
      for (let i = 0; i < 5; i++) {
        observerCallback([srcMutation], {} as MutationObserver);
      }

      // run() should not have been called yet (debounce pending)
      expect(runSpy).not.toHaveBeenCalled();
      expect(content.getNavState().srcDebounceTimer).not.toBeNull();

      // Advance past the 150ms debounce window
      jest.advanceTimersByTime(150);

      // Only a single run() call should have fired
      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(content.getNavState().srcDebounceTimer).toBeNull();

      runSpy.mockRestore();
    });

    it('should clear pending debounce timer when cleanupVideoSrcObserver is called', () => {
      const runSpy = jest.spyOn(content, 'run').mockResolvedValue();

      content.observeVideoSrcChange();

      const srcMutation = {
        type: 'attributes',
        attributeName: 'src',
      } as unknown as MutationRecord;

      // Trigger a mutation to start the debounce timer
      observerCallback([srcMutation], {} as MutationObserver);
      expect(content.getNavState().srcDebounceTimer).not.toBeNull();

      // Cleanup should clear the pending timer
      content.resetNavState();
      expect(content.getNavState().srcDebounceTimer).toBeNull();

      // Advancing time should NOT trigger run()
      jest.advanceTimersByTime(200);
      expect(runSpy).not.toHaveBeenCalled();

      runSpy.mockRestore();
    });
  });

  describe('cleanupFallback', () => {
    it('should clear fallback timer', () => {
      content.handleSpaNavigation();
      expect(content.getNavState().navFallbackTimer).not.toBeNull();

      content.cleanupFallback();
      expect(content.getNavState().navFallbackTimer).toBeNull();
    });

    it('should disconnect fallback observer', () => {
      // Set up observer by triggering fallback
      document.body.innerHTML = '<div></div>';

      content.handleSpaNavigation();
      jest.advanceTimersByTime(2100);

      expect(content.getNavState().fallbackObserver).not.toBeNull();

      content.cleanupFallback();
      expect(content.getNavState().fallbackObserver).toBeNull();
    });
  });

  describe('resetNavState', () => {
    it('should clear active fallback timer without requiring cleanupFallback first', () => {
      const waitSpy = jest
        .spyOn(waitForPlayer, 'waitForPlayerElements')
        .mockImplementation(undefined);

      content.handleSpaNavigation();
      expect(content.getNavState().navFallbackTimer).not.toBeNull();

      content.resetNavState();
      expect(content.getNavState().navFallbackTimer).toBeNull();

      // If resetNavState forgot to clearTimeout, this would create fallback observer
      jest.advanceTimersByTime(2100);
      expect(content.getNavState().fallbackObserver).toBeNull();

      waitSpy.mockRestore();
    });

    it('should disconnect active fallback observer without requiring cleanupFallback first', async () => {
      const waitSpy = jest
        .spyOn(waitForPlayer, 'waitForPlayerElements')
        .mockImplementation(undefined);

      document.body.innerHTML = '<div id="page"></div>';
      content.handleSpaNavigation();
      jest.advanceTimersByTime(2100);
      expect(content.getNavState().fallbackObserver).not.toBeNull();

      const runSpy = jest.spyOn(content, 'run');

      content.resetNavState();
      expect(content.getNavState().fallbackObserver).toBeNull();

      // If resetNavState forgot to disconnect(), stale observer would call run()
      document.getElementById('page')!.innerHTML = HTML_PLAYER_FULL;
      await Promise.resolve();
      await Promise.resolve();
      expect(runSpy).not.toHaveBeenCalled();

      runSpy.mockRestore();
      waitSpy.mockRestore();
    });
  });

  describe('cleanupNavState', () => {
    it('should reset all navigation state', () => {
      content.handleSpaNavigation();

      content.cleanupNavState();

      const state = content.getNavState();
      expect(state.isInitPending).toBe(false);
      expect(state.navFallbackTimer).toBeNull();
    });
  });

  describe('bindNavListeners', () => {
    it('should bind listeners only once', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      content.bindNavListeners();
      const callCount1 = addEventListenerSpy.mock.calls.filter(
        (call) =>
          call[0] === 'yt-navigate-finish' || call[0] === 'yt-page-data-updated'
      ).length;

      content.bindNavListeners();
      const callCount2 = addEventListenerSpy.mock.calls.filter(
        (call) =>
          call[0] === 'yt-navigate-finish' || call[0] === 'yt-page-data-updated'
      ).length;

      // Should not add more listeners on second call
      expect(callCount2).toBe(callCount1);

      addEventListenerSpy.mockRestore();
    });
  });

  describe('YouTube SPA events trigger re-initialization', () => {
    it('should trigger handleSpaNavigation when yt-navigate-finish fires', () => {
      // The listeners are already bound at module load time
      // We verify by checking that state changes when event fires
      content.resetNavState();
      expect(content.getNavState().isInitPending).toBe(false);

      document.dispatchEvent(new Event('yt-navigate-finish'));

      // handleSpaNavigation was called, so isInitPending should be true
      expect(content.getNavState().isInitPending).toBe(true);
    });

    it('should trigger handleSpaNavigation when yt-page-data-updated fires', () => {
      content.resetNavState();
      expect(content.getNavState().isInitPending).toBe(false);

      document.dispatchEvent(new Event('yt-page-data-updated'));

      expect(content.getNavState().isInitPending).toBe(true);
    });
  });
});
