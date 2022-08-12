import {
  test as base,
  expect,
  BrowserContext,
  chromium,
} from '@playwright/test';
import path from 'path';
import { getLocatorElements, getVideoTime, setVideoTime } from './helpers';

const EXTENSION_PATH = `../../dist/webext-dev`;

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, EXTENSION_PATH);
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.youtube.com/watch?v=HGl75kurxok');
  const video = page.locator('ytd-player video');
  // pause the video
  await video.click();
  // reset the time
  await video.evaluate((video: HTMLVideoElement) => (video.currentTime = 0));
});

test('should change the video time by clicking the arrows', async ({
  page,
}) => {
  const { forwardButton, video, rewindButton } = getLocatorElements(page);
  await test.step('Click the forward button', async () => {
    await forwardButton.click();
    const currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(5);
  });

  await test.step('Click the rewind button', async () => {
    await setVideoTime(video, 20);
    await rewindButton.click();
    const currentTime = await getVideoTime(video);
    expect(currentTime).toBe(15);
  });
});

test('should have the arrows and work when navigate to another video', async ({
  page,
}) => {
  const { forwardButton, video, rewindButton } = getLocatorElements(page);
  const newVideoContainer = page.locator('ytd-compact-video-renderer').first();
  const url: string = await newVideoContainer.evaluate((newVideoContainer) => {
    return (newVideoContainer.querySelector('a#thumbnail') as HTMLLinkElement)
      .href;
  });
  await page.locator('ytd-compact-video-renderer img').first().click();
  await expect(page).toHaveURL(url);
});
