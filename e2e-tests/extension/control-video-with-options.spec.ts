import { expect } from '@playwright/test';
import {
  fillInputsWithChangedValues,
  getOptionFilePath,
  getOptionsInputs,
  getVideoLocatorElements,
  getVideoTime,
  handleAds,
  resetVideo,
  setVideoTime,
  test,
  YOUTUBE_URL,
} from './helpers';

test.setTimeout(60 * 1000);

test('should changed options affect the video without refresh', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  await videoPage.goto(YOUTUBE_URL);

  let optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);
  await optionPage.goto(optionFilePath);

  await test.step('Open YouTube page + Options page on new tab', async () => {
    const { video } = getVideoLocatorElements(videoPage);
    await handleAds(videoPage);
    await resetVideo(video);

    await expect(videoPage).toHaveURL(YOUTUBE_URL);
    await expect(optionPage).toHaveURL(optionFilePath);
  });

  await test.step('Change the options should take affect in the youtube page', async () => {
    const {
      forwardSecondsInput,
      rewindSecondsInput,
      shouldOverrideKeysCheckbox,
    } = getOptionsInputs(optionPage);
    await fillInputsWithChangedValues(
      forwardSecondsInput,
      rewindSecondsInput,
      shouldOverrideKeysCheckbox
    );
    await optionPage.locator('button[type="submit"]').click();
    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Verify the youtube page with the new options', async () => {
    const { forwardButton, video, rewindButton } =
      getVideoLocatorElements(videoPage);
    await setVideoTime(video, 0);
    await forwardButton.click();
    await forwardButton.click();
    let currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(80);
    await rewindButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(30);
  });

  await test.step('Reopen the options page to reset the values', async () => {
    optionPage = await context.newPage();
    await optionPage.goto(optionFilePath);
    optionPage.on('dialog', (dialog) => dialog.accept());
    await optionPage.locator('button#reset-values').click();
    await optionPage.locator('button[type="submit"]').click();
    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Youtube page should return to the initial options', async () => {
    const { forwardButton, video, rewindButton } =
      getVideoLocatorElements(videoPage);
    await setVideoTime(video, 0);
    await forwardButton.click();
    let currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(5);
    await rewindButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(0);
  });
});
