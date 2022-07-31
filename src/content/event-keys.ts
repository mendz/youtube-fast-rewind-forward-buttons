import { getSeconds as eventKeys } from './helper';
import { updateVideoTime } from './handle-video-player';
import { ALL_KEY_CODES, ArrowKey, KEY_CODES } from './types';

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
export function isShouldSkipOverrideKeys(
  eventKey: ArrowKey,
  options: IOptions
): boolean {
  const isNotKey = !ALL_KEY_CODES.includes(eventKey);
  return (
    isNotKey ||
    !options.shouldOverrideKeys ||
    (eventKey === ArrowKey.ARROW_LEFT_KEY && options.rewindSeconds === 5) ||
    (eventKey === ArrowKey.ARROW_RIGHT_KEY && options.forwardSeconds === 5)
  );
}

export function overrideArrowKeys(
  event: KeyboardEvent,
  options: IOptions,
  video: HTMLVideoElement
): void {
  if (isShouldSkipOverrideKeys(event.key as ArrowKey, options)) {
    return;
  }
  event.preventDefault();
  updateVideoTime({
    seconds: eventKeys(event.key, options),
    video,
    updateType: event.key as ArrowKey,
  });
}
