import { openOptionsPage } from '../popup';

describe('popup page', () => {
  it('should run chrome runtime openOptionsPage', () => {
    const spy = jest.spyOn(chrome.runtime, 'openOptionsPage');
    openOptionsPage();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
