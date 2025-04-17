import { expect, Locator, Page } from '@playwright/test';
import {
  test,
  getVideoLocatorElements,
  getVideoTime,
  setVideoTime,
  resetVideo,
  getTooltip,
  handleAds,
  YOUTUBE_URL,
  clickOnNewVideoOnMainPage,
} from './helpers';

test.setTimeout(60 * 1000);

test.beforeEach(async ({ page }) => {
  await page.goto(YOUTUBE_URL);
  const video = page.locator('ytd-player video');
  // pause the video
  await resetVideo(video, page);
  await handleAds(page);
});

test('should change the video time by clicking the arrows', async ({
  page,
}) => {
  const { forwardButton, video, rewindButton } = getVideoLocatorElements(page);
  await handleAds(page);

  await testClickingButtons(video, forwardButton, rewindButton);

  await test.step('Click the forward & rewind button multiply times', async () => {
    await setVideoTime(video, 0);
    await forwardButton.click();
    await forwardButton.click();
    await forwardButton.click();
    let currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(15);
    await rewindButton.click();
    await rewindButton.click();
    await rewindButton.click();
    await rewindButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(0);
  });
});

test('should change the video time by pressing the arrows keys', async ({
  page,
}) => {
  const { video } = getVideoLocatorElements(page);
  await handleAds(page);

  await testPressingArrowKeys(video, page);

  await test.step('Pressing the Arrow Right/Left keys multiply times', async () => {
    await setVideoTime(video, 0);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    let currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(15);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(0);
  });
});

test('should have the arrows and work when navigate to another video', async ({
  page,
}) => {
  test.slow();
  const newVideoContainer = page.locator('ytd-compact-video-renderer').first();
  const url: string = await newVideoContainer.evaluate((newVideoContainer) => {
    return (newVideoContainer.querySelector('a#thumbnail') as HTMLLinkElement)
      .href;
  });
  await page.locator('ytd-compact-video-renderer img').first().click();

  const extractParams = (url: string) => {
    const parsedUrl = new URL(url);
    return { site: parsedUrl.origin, v: parsedUrl.searchParams.get('v') };
  };
  const expectedParams = extractParams(url);
  const actualParams = extractParams(page.url());
  expect(expectedParams.site).toBe(actualParams.site);
  expect(expectedParams.v).toBe(actualParams.v);

  await page.reload();

  const { forwardButton, video, rewindButton } = getVideoLocatorElements(page);

  await handleAds(page);
  await resetVideo(video, page);

  await testClickingButtons(video, forwardButton, rewindButton);
  await testPressingArrowKeys(video, page);
});

test('should show the tooltip with correct text', async ({ page }) => {
  const { forwardButton, video, rewindButton } = getVideoLocatorElements(page);
  await test.step('Click the forward button, show tooltip', async () => {
    await setVideoTime(video, 0);
    await forwardButton.click();
    const tooltip = getTooltip(page);
    await expect(tooltip).toHaveText('Go forward 5 seconds (right arrow)');
  });

  await test.step('Click the forward button, show tooltip', async () => {
    await setVideoTime(video, 20);
    await rewindButton.click();
    const tooltip = getTooltip(page);
    await expect(tooltip).toHaveText('Go back 5 seconds (left arrow)');
  });
});

test('should add arrows when entering a video from the main page', async ({
  page,
  context,
}) => {
  test.slow();
  page.close();
  const newPage = await context.newPage();
  await clickOnNewVideoOnMainPage(newPage);
  await newPage.reload();
  await handleAds(newPage);

  // pause the video
  const video = newPage.locator('ytd-player video');
  await resetVideo(video, newPage);
  const { forwardButton, rewindButton } = getVideoLocatorElements(newPage);

  await testClickingButtons(video, forwardButton, rewindButton);
  await testPressingArrowKeys(video, newPage);
});

test('should not change video time when input or contenteditable element is focused', async ({
  page,
}) => {
  // Helper function to test time remains unchanged
  const testTimeUnchanged = async (element: Locator) => {
    const { video } = getVideoLocatorElements(page);
    await setVideoTime(video, 10);
    const initialTime = await getVideoTime(video);

    await element.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');

    const finalTime = await getVideoTime(video);
    expect(finalTime).toBe(initialTime);
  };

  // Test with input element
  await test.step('Focus on input element and press arrow keys', async () => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.id = 'test-input';
      document.body.appendChild(input);
    });
    const inputLocator = page.locator('#test-input');
    await testTimeUnchanged(inputLocator);

    await page.evaluate(() => {
      const input = document.getElementById('test-input');
      if (input) {
        input.remove();
      }
    });
  });

  // Test with contenteditable element
  await test.step('Focus on contenteditable element and press arrow keys', async () => {
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.id = 'test-contenteditable';
      div.contentEditable = 'true';
      document.body.appendChild(div);
    });
    const contentEditableLocator = page.locator('#test-contenteditable');
    await testTimeUnchanged(contentEditableLocator);

    await page.evaluate(() => {
      const div = document.getElementById('test-contenteditable');
      if (div) {
        div.remove();
      }
    });
  });
});

test.setTimeout(30 * 1000);

async function testClickingButtons(
  video: Locator,
  forwardButton: Locator,
  rewindButton: Locator
) {
  await test.step('Click the forward button', async () => {
    await setVideoTime(video, 0);
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
}

async function testPressingArrowKeys(video: Locator, page: Page) {
  await test.step('Pressing the ArrowRight key', async () => {
    await setVideoTime(video, 0);
    await page.keyboard.press('ArrowRight');
    const currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(5);
  });

  await test.step('Pressing the ArrowLeft key', async () => {
    await setVideoTime(video, 20);
    await page.keyboard.press('ArrowLeft');
    const currentTime = await getVideoTime(video);
    expect(currentTime).toBe(15);
  });
}
