import { ArrowKey, VideoTimeArg } from './types';

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
