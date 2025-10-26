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

const EXTENSION_PATH = `../dist/webext-dev`;
export const YOUTUBE_URL = 'https://www.youtube.com/watch?v=HGl75kurxok';

export const OPTIONS_DEFAULT_VALUES = {
  rewindSecondsInput: '5',
  forwardSecondsInput: '5',
  shouldOverrideKeysCheckbox: false,
  secondarySeconds: {
    checkboxIsEnabled: false,
    rewindSeconds: '5',
    forwardSeconds: '5',
  },
};

export const OPTIONS_CHANGED_VALUES = {
  rewindSecondsInput: '40',
  complexRewindSecondsInput: '70',
  forwardSecondsInput: '50',
  complexForwardSecondsInput: '4121',
  shouldOverrideKeysCheckbox: true,
  secondarySeconds: {
    checkboxIsEnabled: false,
    rewindSeconds: '15',
    forwardSeconds: '20',
    complexForwardSecondaryInput: '4121',
    complexRewindSecondaryInput: '4121',
  },
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
        // the new headless arg for chrome v109+. Use '--headless=chrome'
        // as arg for browsers v94-108.
        // `--headless=new`,
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
  const secondaryRewindButton = page.locator('#ml-custom-double-rewind-button');
  const secondaryForwardButton = page.locator(
    '#ml-custom-double-forward-button'
  );
  return {
    forwardButton,
    video,
    rewindButton,
    secondaryRewindButton,
    secondaryForwardButton,
  };
}

export function getTooltip(page: Page): Locator {
  return page.locator('div.ytp-tooltip-text-wrapper span.ytp-tooltip-text');
}

export function getVideoTime(video: Locator): Promise<number> {
  return video.evaluate((video: HTMLVideoElement) => video.currentTime);
}

export async function setVideoTime(
  video: Locator,
  newTimeInSeconds: number
): Promise<void> {
  try {
    await video.waitFor({ state: 'visible' });
    await video.evaluate((video: HTMLVideoElement, newTimeInSeconds) => {
      video.pause();
      video.currentTime = newTimeInSeconds;
    }, newTimeInSeconds);
  } catch (error) {
    console.error('Error in setVideoTime evaluate:', error);
    throw error;
  }
}

export async function resetVideo(video: Locator, page: Page) {
  await video.waitFor({ state: 'attached' });
  await video.click();
  await video.evaluate((video: HTMLVideoElement) => {
    video.play();
  });
  // reset the time
  await setVideoTime(video, 0);
  try {
    // set the volume down
    await page
      .locator(
        'button[data-title-no-tooltip="Mute"].ytp-mute-button.ytp-button'
      )
      .click({ timeout: 10000 });
    return video.evaluate((video: HTMLVideoElement) => {
      video.volume = 0;
      video.muted = true;
    });
    // eslint-disable-next-line sonarjs/no-ignored-exceptions, @typescript-eslint/no-unused-vars
  } catch (error) {
    console.info('Video is already muted');
  }
}

async function isAdsInPage(page: Page): Promise<boolean> {
  try {
    const firstSpan = page.waitForSelector('.ytp-ad-simple-ad-badge', {
      state: 'attached',
      timeout: 3000,
    });
    const secondSpan = page.waitForSelector('.ytp-ad-duration-remaining', {
      state: 'attached',
      timeout: 3000,
    });
    const videoAdsContainer = page.waitForSelector(
      '.ytp-ad-player-overlay-layout',
      {
        state: 'attached',
        timeout: 3000,
      }
    );
    return !!(await Promise.any([firstSpan, secondSpan, videoAdsContainer]));
    // eslint-disable-next-line sonarjs/no-ignored-exceptions, @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

async function isCounterSkipButton(page: Page): Promise<boolean> {
  try {
    return !!(await page.waitForSelector(
      '.ytp-skip-ad-button:not([style*="display: none"])',
      {
        state: 'attached',
        timeout: 5000,
        strict: false,
      }
    ));
    // eslint-disable-next-line sonarjs/no-ignored-exceptions, @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

async function isCounterSkipButtonLeave(page: Page): Promise<boolean> {
  try {
    return !!(await page.waitForSelector('.ytp-skip-ad-button', {
      state: 'detached',
      timeout: 5000,
      strict: false,
    }));
    // eslint-disable-next-line sonarjs/no-ignored-exceptions, @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

export async function getSkipAdButton(
  page: Page
): Promise<ElementHandle<HTMLElement | SVGElement> | null> {
  try {
    return await page.waitForSelector(
      '.ytp-skip-ad-button:not([style*="display: none"])',
      {
        state: 'attached',
        timeout: 1000,
      }
    );
    // eslint-disable-next-line sonarjs/no-ignored-exceptions, @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

export async function isAdsLeavePage(page: Page): Promise<boolean> {
  try {
    const firstSpan = page.waitForSelector('.ytp-ad-simple-ad-badge', {
      state: 'detached',
    });
    const secondSpan = page.waitForSelector('.ytp-ad-duration-remaining', {
      state: 'detached',
    });
    const videoAdsContainer = page.waitForSelector(
      '.ytp-ad-player-overlay-layout',
      {
        state: 'detached',
        timeout: 3000,
      }
    );
    return !!(await Promise.any([firstSpan, secondSpan, videoAdsContainer]));
    // eslint-disable-next-line sonarjs/no-ignored-exceptions, @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

async function isSponsorAds(page: Page): Promise<boolean> {
  try {
    return !!(await page.waitForSelector(
      '.ytp-ad-player-overlay-layout__ad-info-container',
      {
        state: 'detached',
      }
    ));
    // eslint-disable-next-line sonarjs/no-ignored-exceptions, @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

export async function handleAds(page: Page) {
  const isShouldWait = await isSponsorAds(page);
  if (isShouldWait) {
    await page.waitForTimeout(20 * 1000);
  }

  const [isFirstAdExists, isCounterSkipButtonExists, firstSkipButton] =
    await Promise.all([
      isAdsInPage(page),
      isCounterSkipButton(page),
      getSkipAdButton(page),
    ]);
  let skipButtonAfterCounter: ElementHandle<HTMLElement | SVGElement> | null;

  if (isFirstAdExists && !firstSkipButton) {
    await isAdsLeavePage(page);
    // handle the ads in the after the navigation
    const [
      isSecondAdExists,
      isSecondCounterSkipButtonExists,
      secondSkipButton,
    ] = await Promise.all([
      isAdsInPage(page),
      isCounterSkipButton(page),
      getSkipAdButton(page),
    ]);

    if (isSecondAdExists && !secondSkipButton) {
      await isAdsLeavePage(page);
    } else {
      if (isSecondCounterSkipButtonExists) {
        await isCounterSkipButtonLeave(page);
        skipButtonAfterCounter = await getSkipAdButton(page);
        skipButtonAfterCounter?.click();
      } else {
        await secondSkipButton?.click();
      }
    }
    // takes a few seconds until the real video start
    await page.waitForTimeout(10000);
  } else {
    if (isCounterSkipButtonExists) {
      await isCounterSkipButtonLeave(page);
      skipButtonAfterCounter = await getSkipAdButton(page);
      skipButtonAfterCounter?.click();
    } else {
      await firstSkipButton?.click();
    }
  }
}

export async function getOptionFilePath(extensionId: string): Promise<string> {
  return geFilePath(extensionId, 'options');
}

export async function getWhatsNewFilePath(
  extensionId: string
): Promise<string> {
  return geFilePath(extensionId, 'whats-new-page', 'background/whats-new-page');
}

async function geFilePath(
  extensionId: string,
  fileName: 'options' | 'whats-new-page',
  folderPath = ''
): Promise<string> {
  const extFolderPath = path.join(__dirname, EXTENSION_PATH, `/${folderPath}/`);
  const files = await fs.promises.readdir(extFolderPath);
  const foundedFileName = files.find((file: string) =>
    new RegExp(`${fileName}.*html$`).test(file)
  );
  if (fileName) {
    const path = folderPath?.length ? `${folderPath}/` : '';
    return `chrome-extension://${extensionId}/${path}${foundedFileName}`;
  }
  throw new Error(`Couldn't find the option page!`);
}

/**
 * Fill the inputs with the new values to test the options page.
 *
 * This function will fill the inputs of the options page with the values
 * that are not the default values. The values are stored in the
 * `OPTIONS_CHANGED_VALUES` object.
 *
 * @param rewindSecondsInput The input element for the rewind seconds.
 * @param forwardSecondsInput The input element for the forward seconds.
 * @param shouldOverrideKeysCheckbox The checkbox element for overriding the
 *   arrow keys.
 * @param shouldOverrideMediaKeysCheckbox The checkbox element for overriding
 *   the media keys.
 * @param isComplex If true, the function will fill the inputs with the
 *   `complexRewindSecondsInput` and `complexForwardSecondsInput` values.
 */
export async function fillInputsWithChangedValues(
  rewindSecondsInput: Locator,
  forwardSecondsInput: Locator,
  shouldOverrideKeysCheckbox: Locator,
  shouldOverrideMediaKeysCheckbox: Locator,
  isComplex = false,
  secondarySeconds?: {
    checkboxIsEnabledInput: Locator;
    rewindSecondsInput?: Locator;
    forwardSecondsInput?: Locator;
  }
) {
  const rewindValue = isComplex
    ? OPTIONS_CHANGED_VALUES.complexRewindSecondsInput
    : OPTIONS_CHANGED_VALUES.rewindSecondsInput;
  const forwardValue = isComplex
    ? OPTIONS_CHANGED_VALUES.complexForwardSecondsInput
    : OPTIONS_CHANGED_VALUES.forwardSecondsInput;

  await rewindSecondsInput.fill(rewindValue);
  await forwardSecondsInput.fill(forwardValue);

  await shouldOverrideKeysCheckbox.check();
  await shouldOverrideMediaKeysCheckbox.check();

  if (secondarySeconds?.checkboxIsEnabledInput) {
    await secondarySeconds.checkboxIsEnabledInput.check();
    const secondaryRewindValue = isComplex
      ? OPTIONS_CHANGED_VALUES.secondarySeconds.complexRewindSecondaryInput
      : OPTIONS_CHANGED_VALUES.secondarySeconds.rewindSeconds;
    const secondaryForwardValue = isComplex
      ? OPTIONS_CHANGED_VALUES.secondarySeconds.complexForwardSecondaryInput
      : OPTIONS_CHANGED_VALUES.secondarySeconds.forwardSeconds;

    await secondarySeconds.rewindSecondsInput?.fill(secondaryRewindValue);
    await secondarySeconds.forwardSecondsInput?.fill(secondaryForwardValue);
  }
}

export function getOptionsInputs(page: Page) {
  const rewindSecondsInput = page.locator('input#rewind');
  const forwardSecondsInput = page.locator('input#forward');
  const shouldOverrideArrowKeysCheckbox = page.locator(
    'input#override-arrow-keys'
  );
  const shouldOverrideMediaKeysCheckbox = page.locator(
    'input#override-media-keys'
  );
  const rewindOutput = page.locator('small output#rewindValue');
  const forwardOutput = page.locator('small output#forwardValue');

  const rewindSecondaryInput = page.locator('input#rewind-secondary');
  const forwardSecondaryInput = page.locator('input#forward-secondary');

  const rewindSecondaryOutput = page.locator(
    'small output#rewind-secondaryValue'
  );
  const forwardSecondaryOutput = page.locator(
    'small output#forward-secondaryValue'
  );
  const enableMoreButtonsCheckbox = page.locator('input#enable-more-buttons');

  return {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    rewindOutput,
    forwardOutput,
    rewindSecondaryInput,
    forwardSecondaryInput,
    rewindSecondaryOutput,
    forwardSecondaryOutput,
    enableMoreButtonsCheckbox,
  };
}

export async function clickOnNewVideoOnMainPage(newPage: Page) {
  await newPage.goto('https://www.youtube.com/');
  try {
    await newPage.locator('div.ytd-rich-item-renderer').nth(1).click({
      timeout: 10000,
    }); // click on the second video because the first is an ad
  } catch (error) {
    console.warn(`Couldn't click on the new video, search issue ${error}`);
    await newPage.reload();
    await newPage.locator('div.ytd-rich-item-renderer').nth(1).click();
  }
}

export async function getShadowHostSupportLinks(page: Page) {
  const shadowHost = page.locator('support-links');
  await shadowHost.waitFor(); // Ensure the custom element itself is in the DOM
  return shadowHost;
}
