import { updateVideoTime } from '../handle-video-player';
import { ArrowKey } from '../types';

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
