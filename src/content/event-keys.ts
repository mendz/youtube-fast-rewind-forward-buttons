import { getSeconds as eventKeys } from './helper';
import { updateVideoTime } from './handle-video-player';
import {
  ALL_ARROW_KEY_CODES,
  ArrowKey,
  IOptions,
  KEY_CODES,
  MediaTrackKey,
} from './types';

const MEDIA_KEYS_TO_ARROW_KEYS = {
  [MediaTrackKey.MEDIA_TRACK_PREVIOUS]: ArrowKey.ARROW_LEFT_KEY,
  [MediaTrackKey.MEDIA_TRACK_NEXT]: ArrowKey.ARROW_RIGHT_KEY,
};

export function simulateKey(key: ArrowKey): void {
  const event: KeyboardEvent = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: KEY_CODES[key],
    which: KEY_CODES[key],
  } as KeyboardEventInit);
  const body: HTMLBodyElement | null = document.querySelector('body');
  if (body) {
    body.dispatchEvent(event);
  } else {
    console.error(`simulateKey failed, couldn't find body`);
  }
}

/**
 * Checks:
 * * The event key is part of the ArrowLeft / ArrowRight keys
 * * For the correct event key if its 5 seconds or not
 * @returns boolean if should skip
 */
export function isShouldSkipOverrideArrowKeys(
  eventKey: ArrowKey,
  options: IOptions
): boolean {
  const isNotKey = !ALL_ARROW_KEY_CODES.includes(eventKey);
  return (
    isNotKey ||
    !options.shouldOverrideArrowKeys ||
    (eventKey === ArrowKey.ARROW_LEFT_KEY && options.rewindSeconds === 5) ||
    (eventKey === ArrowKey.ARROW_RIGHT_KEY && options.forwardSeconds === 5)
  );
}

export function overrideArrowKeys(
  event: KeyboardEvent,
  options: IOptions,
  video: HTMLVideoElement
): void {
  if (isShouldSkipOverrideArrowKeys(event.key as ArrowKey, options)) {
    return;
  }
  event.preventDefault();
  updateVideoTime({
    seconds: eventKeys(event.key, options),
    video,
    updateType: event.key as ArrowKey,
  });
}

export function overrideMediaKeys(
  event: KeyboardEvent,
  options: IOptions,
  video: HTMLVideoElement
): void {
  if (!options.shouldOverrideMediaKeys) {
    return;
  }

  event.preventDefault();

  const mediaTrackKey = event.key as MediaTrackKey;
  const arrowKey = MEDIA_KEYS_TO_ARROW_KEYS[mediaTrackKey];

  if (
    (options.rewindSeconds === 5 && arrowKey === ArrowKey.ARROW_LEFT_KEY) ||
    (options.forwardSeconds === 5 && arrowKey === ArrowKey.ARROW_RIGHT_KEY)
  ) {
    simulateKey(arrowKey);
    return;
  }

  updateVideoTime({
    seconds: eventKeys(arrowKey, options),
    video,
    updateType: arrowKey,
  });
}
