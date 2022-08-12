import {
  test as base,
  expect,
  BrowserContext,
  chromium,
} from '@playwright/test';
import path from 'path';

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

test('should change the video time by clicking the arrows', async ({
  page,
}) => {
  await page.goto('https://www.youtube.com/watch?v=HGl75kurxok');
  const video = page.locator('ytd-player video');
  const rewindButton = page.locator('#ml-custom-rewind-button');
  const forwardButton = page.locator('#ml-custom-forward-button');
  // pause the video
  await video.click();
  await video.evaluate((video: HTMLVideoElement) => (video.currentTime = 0));
  await forwardButton.click();
  let currentTime = await video.evaluate(
    (video: HTMLVideoElement) => video.currentTime
  );
  expect(currentTime).toBe(5);

  await video.evaluate((video: HTMLVideoElement) => (video.currentTime = 20));
  await rewindButton.click();
  currentTime = await video.evaluate(
    (video: HTMLVideoElement) => video.currentTime
  );
  expect(currentTime).toBe(15);
});
