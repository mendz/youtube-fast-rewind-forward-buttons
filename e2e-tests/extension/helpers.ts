import {
  BrowserContext,
  chromium,
  ElementHandle,
  Locator,
  Page,
  test as base,
} from '@playwright/test';
import fs from 'fs';
import path from 'path';

const EXTENSION_PATH = `../../dist/webext-dev`;
export const YOUTUBE_URL = 'https://www.youtube.com/watch?v=HGl75kurxok';

export const OPTIONS_DEFAULT_VALUES = {
  rewindSecondsInput: '5',
  forwardSecondsInput: '5',
  shouldOverrideKeysCheckbox: false,
};

export const OPTIONS_CHANGED_VALUES = {
  rewindSecondsInput: '40',
  forwardSecondsInput: '50',
  shouldOverrideKeysCheckbox: true,
};

export const BUTTON_SUBMIT_SELECTOR = 'button[type="submit"]';

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

export function getVideoLocatorElements(page: Page) {
  const video = page.locator('ytd-player video');
  const rewindButton = page.locator('#ml-custom-rewind-button');
  const forwardButton = page.locator('#ml-custom-forward-button');
  return { forwardButton, video, rewindButton };
}

export function getTooltip(page: Page): Locator {
  return page.locator('div.ytp-tooltip-text-wrapper span.ytp-tooltip-text');
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

export async function resetVideo(video: Locator, page: Page) {
  await video.click();
  // reset the time
  await setVideoTime(video, 0);
  try {
    // set the volume down
    await page
      .locator(
        'button[data-title-no-tooltip="Mute"].ytp-mute-button.ytp-button'
      )
      .click({ timeout: 10000 });
  } catch (error) {
    console.info('Video is already muted');
  }
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

export async function handleAds(page: Page) {
  const isFirstAdExists = await isAdsInPage(page);
  const firstSkipButton = await getSkipAdButton(page);

  if (isFirstAdExists && !firstSkipButton) {
    await isAdsLeavePage(page);
    // handle the ads in the after the navigation
    const isSecondAdExists = await isAdsInPage(page);
    const secondSkipButton = await getSkipAdButton(page);
    if (isSecondAdExists && !secondSkipButton) {
      await isAdsLeavePage(page);
    } else {
      await secondSkipButton?.click();
    }
    // takes a few seconds until the real video start
    await page.waitForTimeout(10000);
  } else {
    await firstSkipButton?.click();
  }
}

export async function getOptionFilePath(extensionId: string): Promise<string> {
  const extFolderPath = path.join(__dirname, EXTENSION_PATH);
  const files = await fs.promises.readdir(extFolderPath);
  const optionFileName = files.find((file: string) =>
    /options.*html$/.test(file)
  );
  if (optionFileName) {
    return `chrome-extension://${extensionId}/${optionFileName}`;
  }
  throw new Error(`Couldn't find the option page!`);
}

export async function fillInputsWithChangedValues(
  rewindSecondsInput: Locator,
  forwardSecondsInput: Locator,
  shouldOverrideKeysCheckbox: Locator,
  shouldOverrideMediaKeysCheckbox: Locator
) {
  await rewindSecondsInput.fill(OPTIONS_CHANGED_VALUES.rewindSecondsInput);
  await forwardSecondsInput.fill(OPTIONS_CHANGED_VALUES.forwardSecondsInput);
  await shouldOverrideKeysCheckbox.check();
  await shouldOverrideMediaKeysCheckbox.check();
}

export function getOptionsInputs(page: Page) {
  const rewindSecondsInput = page.locator('input#rewind');
  const forwardSecondsInput = page.locator('input#forward');
  const shouldOverrideArrowKeysCheckbox = page.locator(
    'input#override-arrow-keys'
  );
  const shouldOverrideMediaKeysCheckbox = page.locator(
    'input#override-media-kays'
  );
  return {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
  };
}
