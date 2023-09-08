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
} from './helpers';

test.setTimeout(60 * 1000);

test.beforeEach(async ({ page }) => {
  await page.goto(YOUTUBE_URL);
  const video = page.locator('ytd-player video');
  // pause the video
  await resetVideo(video, page);
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
  const newVideoContainer = page.locator('ytd-compact-video-renderer').first();
  const url: string = await newVideoContainer.evaluate((newVideoContainer) => {
    return (newVideoContainer.querySelector('a#thumbnail') as HTMLLinkElement)
      .href;
  });
  await page.locator('ytd-compact-video-renderer img').first().click();
  await expect(page).toHaveURL(url);
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

test.setTimeout(30 * 1000);

test('Should add arrows when entering a video from the main page', async ({
  page,
  context,
}) => {
  page.close();
  const newPage = await context.newPage();
  await newPage.goto('https://www.youtube.com/');
  await newPage.locator('div.ytd-rich-item-renderer').first().click();
  const video = newPage.locator('ytd-player video');
  // pause the video
  await handleAds(newPage);
  await resetVideo(video, newPage);
  const { forwardButton, rewindButton } = getVideoLocatorElements(newPage);

  await testClickingButtons(video, forwardButton, rewindButton);
  await testPressingArrowKeys(video, newPage);
});

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
