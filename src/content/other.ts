import { ArrowKey, KEY_CODES, VideoTimeArg } from './types';

// TODO: change the name of the file or break between these two functions

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

export function updateVideoTime({
  seconds,
  video,
  updateType,
}: VideoTimeArg): void {
  if (updateType === ArrowKey.ARROW_LEFT_KEY) {
    video.currentTime -= seconds;
  } else if (updateType === ArrowKey.ARROW_RIGHT_KEY) {
    video.currentTime += seconds;
  }
}
