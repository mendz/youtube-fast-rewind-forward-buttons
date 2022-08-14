import { Page, Locator, ElementHandle } from '@playwright/test';

export function getLocatorElements(page: Page) {
  const video = page.locator('ytd-player video');
  const rewindButton = page.locator('#ml-custom-rewind-button');
  const forwardButton = page.locator('#ml-custom-forward-button');
  return { forwardButton, video, rewindButton };
}

export function getVideoTime(video: Locator): Promise<number> {
  return video.evaluate((video: HTMLVideoElement) => video.currentTime);
}

export function setVideoTime(
  video: Locator,
  newTimeInSeconds: number
): Promise<void> {
  return video.evaluate((video: HTMLVideoElement, newTimeInSeconds) => {
    video.currentTime = newTimeInSeconds;
  }, newTimeInSeconds);
}

export async function resetVideo(video: Locator) {
  await video.click();
  // reset the time
  await setVideoTime(video, 0);
}

export async function isAdsInPage(page: Page): Promise<boolean> {
  try {
    return !!(await page.waitForSelector(
      '.ytp-ad-simple-ad-badge, .ytp-ad-duration-remaining',
      { state: 'attached', timeout: 5000 }
    ));
  } catch (error) {
    return false;
  }
}

export async function getSkipAdButton(
  page: Page
): Promise<ElementHandle<HTMLElement | SVGElement> | null> {
  try {
    return await page.waitForSelector('.ytp-ad-skip-button-container', {
      state: 'attached',
      timeout: 1000,
    });
  } catch (error) {
    return null;
  }
}

export async function isAdsLeavePage(page: Page): Promise<boolean> {
  try {
    return !!(await page.waitForSelector(
      '.ytp-ad-simple-ad-badge, .ytp-ad-duration-remaining',
      { state: 'detached' }
    ));
  } catch (error) {
    return false;
  }
}
