import { expect, Page } from '@playwright/test';
import {
  BUTTON_SUBMIT_SELECTOR,
  fillInputsWithChangedValues,
  getOptionFilePath,
  getOptionsInputs,
  getVideoLocatorElements,
  getVideoTime,
  handleAds,
  OPTIONS_CHANGED_VALUES,
  OPTIONS_DEFAULT_VALUES,
  resetVideo,
  setVideoTime,
  test,
  YOUTUBE_URL,
} from './helpers';

const ANIMATION_ARROW_SELECTOR = 'ytd-player .ytp-doubletap-ui-legacy';

test.setTimeout(60 * 1000);
test.slow();

test('should changed options affect the video without refresh', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  let optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);

  await navigateToYoutubeOptionsPagesSteps(
    videoPage,
    optionPage,
    optionFilePath
  );

  await test.step('Change the options values', async () => {
    const {
      forwardSecondsInput,
      rewindSecondsInput,
      shouldOverrideArrowKeysCheckbox,
      shouldOverrideMediaKeysCheckbox,
    } = getOptionsInputs(optionPage);
    await fillInputsWithChangedValues(
      forwardSecondsInput,
      rewindSecondsInput,
      shouldOverrideArrowKeysCheckbox,
      shouldOverrideMediaKeysCheckbox
    );
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();
    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Verify the youtube page with the new options without refresh', async () => {
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
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();
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

test('should override the arrow keys when seconds set not to 5 and not override if set to 5', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  let optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);

  await navigateToYoutubeOptionsPagesSteps(
    videoPage,
    optionPage,
    optionFilePath
  );

  await test.step('Change the options to override and ArrowRight seconds', async () => {
    const { forwardSecondsInput, shouldOverrideArrowKeysCheckbox } =
      getOptionsInputs(optionPage);

    await forwardSecondsInput.fill(OPTIONS_CHANGED_VALUES.forwardSecondsInput);
    await shouldOverrideArrowKeysCheckbox.check();
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Verify the youtube page press right arrow should be override while left not override', async () => {
    const { video } = getVideoLocatorElements(videoPage);
    await setVideoTime(video, 0);

    await videoPage.keyboard.press('ArrowRight');
    let currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(50);
    const animationArrow = videoPage.locator(ANIMATION_ARROW_SELECTOR);
    await expect(animationArrow).not.toBeVisible();

    await videoPage.keyboard.press('ArrowLeft');
    currentTime = await getVideoTime(video);
    await expect(animationArrow).toBeVisible();
    expect(currentTime).toBe(45);
  });

  await test.step('Change the options to override and ArrowLeft seconds', async () => {
    optionPage = await context.newPage();
    await optionPage.goto(optionFilePath);
    const { rewindSecondsInput, forwardSecondsInput } =
      getOptionsInputs(optionPage);

    await forwardSecondsInput.fill(OPTIONS_DEFAULT_VALUES.forwardSecondsInput);
    await rewindSecondsInput.fill(OPTIONS_CHANGED_VALUES.rewindSecondsInput);
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Verify the youtube page press left arrow should be override while right not override', async () => {
    const { video } = getVideoLocatorElements(videoPage);
    await setVideoTime(video, 80);

    await videoPage.keyboard.press('ArrowLeft');
    let currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(40);
    const animationArrow = videoPage.locator(ANIMATION_ARROW_SELECTOR);
    await expect(animationArrow).not.toBeVisible();

    await videoPage.keyboard.press('ArrowRight');
    currentTime = await getVideoTime(video);
    await expect(animationArrow).toBeVisible();
    expect(currentTime).toBe(45);
  });

  await test.step('Change the options to override and both arrows seconds', async () => {
    optionPage = await context.newPage();
    await optionPage.goto(optionFilePath);
    const { rewindSecondsInput, forwardSecondsInput } =
      getOptionsInputs(optionPage);

    await forwardSecondsInput.fill(OPTIONS_CHANGED_VALUES.forwardSecondsInput);
    await rewindSecondsInput.fill(OPTIONS_CHANGED_VALUES.rewindSecondsInput);
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Verify the youtube page press left/right arrow should be override', async () => {
    const { video, forwardButton, rewindButton } =
      getVideoLocatorElements(videoPage);
    await setVideoTime(video, 0);

    await videoPage.keyboard.press('ArrowRight');
    let currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(50);
    const animationArrow = videoPage.locator(ANIMATION_ARROW_SELECTOR);
    await expect(animationArrow).not.toBeVisible();

    await forwardButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(100);
    await expect(animationArrow).not.toBeVisible();

    await videoPage.keyboard.press('ArrowLeft');
    currentTime = await getVideoTime(video);
    await expect(animationArrow).not.toBeVisible();
    expect(currentTime).toBe(60);

    await rewindButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(20);
    await expect(animationArrow).not.toBeVisible();
  });
});

test('should when not set to override, arrow keys should working as normal while arrow button should change the video time', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  const optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);

  await navigateToYoutubeOptionsPagesSteps(
    videoPage,
    optionPage,
    optionFilePath
  );

  await test.step('Change the options to NOT override and both of arrow buttons seconds is changed', async () => {
    const { forwardSecondsInput, rewindSecondsInput } =
      getOptionsInputs(optionPage);

    await forwardSecondsInput.fill(OPTIONS_CHANGED_VALUES.forwardSecondsInput);
    await rewindSecondsInput.fill(OPTIONS_CHANGED_VALUES.rewindSecondsInput);
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Verify the youtube page press left/right arrow keys should NOT be override while buttons update the video by the new options', async () => {
    const { video, forwardButton, rewindButton } =
      getVideoLocatorElements(videoPage);
    await setVideoTime(video, 0);

    await videoPage.keyboard.press('ArrowRight');
    let currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(5);
    const animationArrow = videoPage.locator(ANIMATION_ARROW_SELECTOR);
    await expect(animationArrow).toBeVisible();

    await forwardButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(55);
    await expect(animationArrow).not.toBeVisible();

    await videoPage.keyboard.press('ArrowLeft');
    currentTime = await getVideoTime(video);
    await expect(animationArrow).toBeVisible();
    expect(currentTime).toBe(50);

    await rewindButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(10);
    await expect(animationArrow).not.toBeVisible();
  });
});

test('should options change affect new youtube page', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  let optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);

  await navigateToOptionsPageStep(optionPage, optionFilePath);

  await test.step('Change the options', async () => {
    const {
      forwardSecondsInput,
      rewindSecondsInput,
      shouldOverrideArrowKeysCheckbox,
    } = getOptionsInputs(optionPage);

    await forwardSecondsInput.fill(OPTIONS_CHANGED_VALUES.forwardSecondsInput);
    await rewindSecondsInput.fill(OPTIONS_CHANGED_VALUES.rewindSecondsInput);
    await shouldOverrideArrowKeysCheckbox.check();
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();
    await videoPage.waitForTimeout(1000);

    expect(optionPage.isClosed()).toBe(true);
  });

  await navigateToYoutubeStep(videoPage);

  await test.step('Verify new youtube page took and use the new options', async () => {
    const { video, forwardButton, rewindButton } =
      getVideoLocatorElements(videoPage);
    await setVideoTime(video, 0);

    await forwardButton.click();
    let currentTime = await getVideoTime(video);
    expect(currentTime).toBe(50);

    await rewindButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(10);
  });

  await test.step('Change the options, one of the arrows', async () => {
    optionPage = await context.newPage();
    await optionPage.goto(optionFilePath);
    const { rewindSecondsInput } = getOptionsInputs(optionPage);

    await rewindSecondsInput.fill(OPTIONS_DEFAULT_VALUES.rewindSecondsInput);
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Verify navigate to another video will take and use the new options', async () => {
    const newVideoContainer = videoPage
      .locator('ytd-compact-video-renderer')
      .first();
    const url: string = await newVideoContainer.evaluate(
      (newVideoContainer) => {
        return (
          newVideoContainer.querySelector('a#thumbnail') as HTMLLinkElement
        ).href;
      }
    );
    await videoPage.locator('ytd-compact-video-renderer img').first().click();
    await expect(videoPage).toHaveURL(url);
    const { video, rewindButton, forwardButton } =
      getVideoLocatorElements(videoPage);

    await handleAds(videoPage);
    await resetVideo(video, videoPage);
    await setVideoTime(video, 10);
    await rewindButton.click();
    let currentTime = await getVideoTime(video);
    expect(currentTime).toBe(5);

    await forwardButton.click();
    forwardButton;
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(55);
  });
});

function navigateToYoutubeStep(videoPage: Page) {
  return test.step('Navigate to YouTube page', async () => {
    await videoPage.goto(YOUTUBE_URL);
    const { video } = getVideoLocatorElements(videoPage);
    await handleAds(videoPage);
    await resetVideo(video, videoPage);

    await expect(videoPage).toHaveURL(YOUTUBE_URL);
  });
}

function navigateToOptionsPageStep(optionPage: Page, optionFilePath: string) {
  return test.step('Navigate Options page', async () => {
    await optionPage.goto(optionFilePath);
    await expect(optionPage).toHaveURL(optionFilePath);
  });
}

async function navigateToYoutubeOptionsPagesSteps(
  videoPage: Page,
  optionPage: Page,
  optionFilePath: string
): Promise<void> {
  const youtubeStepPromise = navigateToYoutubeStep(videoPage);

  const optionsStepPromise = navigateToOptionsPageStep(
    optionPage,
    optionFilePath
  );

  await Promise.all([youtubeStepPromise, optionsStepPromise]);
}
