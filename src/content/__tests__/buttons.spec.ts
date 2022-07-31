import { handleArrowButtons } from '../buttons';
import { ArrowKey } from '../types';
import * as eventKeys from '../event-keys';
import * as handleVideoPlayer from '../handle-video-player';

describe('handleArrowButtons', () => {
  const videoElement = document.createElement('video');
  let simulateKeySpy: jest.SpyInstance<void, [key: ArrowKey]> = jest.spyOn(
    eventKeys,
    'simulateKey'
  );
  let updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');

  beforeAll(async () => {
    simulateKeySpy.mockClear();
    updateVideoTimeSpy.mockClear();
    simulateKeySpy = jest.spyOn(eventKeys, 'simulateKey');
    updateVideoTimeSpy = jest.spyOn(handleVideoPlayer, 'updateVideoTime');
  });

  afterEach(() => {
    simulateKeySpy.mockReset();
  });

  it('should call simulateKey when the seconds === 5', () => {
    handleArrowButtons({
      seconds: 5,
      updateType: ArrowKey.ARROW_LEFT_KEY,
      video: videoElement,
    });
    expect(simulateKeySpy).toHaveBeenCalledTimes(1);
    expect(updateVideoTimeSpy).not.toHaveBeenCalled();
  });
  it('should call updateVideoTime when the seconds !==  5', () => {
    handleArrowButtons({
      seconds: 10,
      updateType: ArrowKey.ARROW_LEFT_KEY,
      video: videoElement,
    });
    expect(updateVideoTimeSpy).toHaveBeenCalledTimes(1);
    expect(simulateKeySpy).not.toHaveBeenCalled();
  });
});
