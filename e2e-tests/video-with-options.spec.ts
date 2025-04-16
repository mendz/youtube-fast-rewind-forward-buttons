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
      rewindSecondsInput,
      forwardSecondsInput,
      shouldOverrideArrowKeysCheckbox,
      shouldOverrideMediaKeysCheckbox,
    } = getOptionsInputs(optionPage);
    await fillInputsWithChangedValues(
      rewindSecondsInput,
      forwardSecondsInput,
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
    expect(currentTime).toBe(100); // 50 + 50
    await rewindButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(60); // 100 - 40
  });

  await test.step('Reopen the options page and set complex values', async () => {
    optionPage = await context.newPage();
    await optionPage.goto(optionFilePath);

    const {
      rewindSecondsInput,
      forwardSecondsInput,
      shouldOverrideArrowKeysCheckbox,
      shouldOverrideMediaKeysCheckbox,
    } = getOptionsInputs(optionPage);

    await fillInputsWithChangedValues(
      rewindSecondsInput,
      forwardSecondsInput,
      shouldOverrideArrowKeysCheckbox,
      shouldOverrideMediaKeysCheckbox,
      true
    );
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();
    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Verify the youtube page with the new options without refresh', async () => {
    const { forwardButton, video, rewindButton } =
      getVideoLocatorElements(videoPage);
    await setVideoTime(video, 0);
    await forwardButton.click();
    let currentTime: number = await getVideoTime(video);
    expect(currentTime).toBe(4121);
    await rewindButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(4051); // 4121 - 70
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

test('should override the ArrowRight key when seconds set not to 5 and not override if set to 5 or both', async ({
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

    await shouldOverrideArrowKeysCheckbox.check();
    await forwardSecondsInput.fill(OPTIONS_CHANGED_VALUES.forwardSecondsInput);
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

test('should override the ArrowLeft key when seconds set not to 5 and not override if set to 5', async ({
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

  await test.step('Change the options to override and ArrowLeft seconds', async () => {
    await optionPage.goto(optionFilePath);
    const {
      rewindSecondsInput,
      forwardSecondsInput,
      shouldOverrideArrowKeysCheckbox,
    } = getOptionsInputs(optionPage);

    await shouldOverrideArrowKeysCheckbox.check();
    await rewindSecondsInput.fill(OPTIONS_CHANGED_VALUES.rewindSecondsInput);
    await forwardSecondsInput.fill(OPTIONS_DEFAULT_VALUES.forwardSecondsInput);
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
    console.log('💜 ~ await test.step ~ currentTime:', currentTime);
    await expect(animationArrow).toBeVisible();
    expect(currentTime).toBe(45);
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
    const { rewindSecondsInput, shouldOverrideArrowKeysCheckbox } =
      getOptionsInputs(optionPage);

    await rewindSecondsInput.fill(OPTIONS_DEFAULT_VALUES.rewindSecondsInput);
    await shouldOverrideArrowKeysCheckbox.check();
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
    await videoPage.reload();

    const { video, rewindButton, forwardButton } =
      getVideoLocatorElements(videoPage);

    await handleAds(videoPage);
    await resetVideo(video, videoPage);
    await setVideoTime(video, 10);

    await rewindButton.click();
    let currentTime = await getVideoTime(video);
    expect(currentTime).toBe(5);

    await forwardButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(55);
  });
});

test('should show the correct title for the buttons when hover', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  const optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);

  await navigateToOptionsPageStep(optionPage, optionFilePath);

  await test.step('Change the options', async () => {
    const {
      forwardSecondsInput,
      rewindSecondsInput,
      shouldOverrideArrowKeysCheckbox,
    } = getOptionsInputs(optionPage);

    await forwardSecondsInput.fill(
      OPTIONS_CHANGED_VALUES.complexForwardSecondsInput
    );
    await rewindSecondsInput.fill(OPTIONS_CHANGED_VALUES.rewindSecondsInput);
    await shouldOverrideArrowKeysCheckbox.check();
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();
    await videoPage.waitForTimeout(1000);

    expect(optionPage.isClosed()).toBe(true);
  });

  await navigateToYoutubeStep(videoPage);

  await test.step('Verify new youtube page show correct titles and aria-label', async () => {
    const { video, forwardButton, rewindButton } =
      getVideoLocatorElements(videoPage);
    await setVideoTime(video, 0);

    expect(await forwardButton.getAttribute('aria-label')).toBe(
      'Go forward 1h 8m 41s (right arrow)'
    );
    expect(await forwardButton.getAttribute('title')).toBe(
      'Go forward 1h 8m 41s (right arrow)'
    );
    expect(await rewindButton.getAttribute('aria-label')).toBe(
      'Go back 40 seconds (left arrow)'
    );
    expect(await rewindButton.getAttribute('title')).toBe(
      'Go back 40 seconds (left arrow)'
    );
  });
});

test('should show secondary seconds buttons when enabled', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  const optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);

  await navigateToOptionsPageStep(optionPage, optionFilePath);

  await test.step('Enable secondary seconds buttons', async () => {
    const {
      enableMoreButtonsCheckbox,
      rewindSecondaryInput,
      forwardSecondaryInput,
    } = getOptionsInputs(optionPage);

    await enableMoreButtonsCheckbox.check();
    await rewindSecondaryInput.fill('15');
    await forwardSecondaryInput.fill('20');
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await navigateToYoutubeStep(videoPage);

  await test.step('Verify secondary seconds buttons are present and functional', async () => {
    const { video, secondaryForwardButton, secondaryRewindButton } =
      getVideoLocatorElements(videoPage);

    await setVideoTime(video, 0);

    await secondaryForwardButton.click();
    let currentTime = await getVideoTime(video);
    expect(currentTime).toBe(20);

    await secondaryRewindButton.click();
    currentTime = await getVideoTime(video);
    expect(currentTime).toBe(5);
  });
});

test('should hide secondary seconds buttons when disabled', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  const optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);

  await navigateToOptionsPageStep(optionPage, optionFilePath);

  await test.step('Disable secondary seconds buttons', async () => {
    const { enableMoreButtonsCheckbox } = getOptionsInputs(optionPage);

    await enableMoreButtonsCheckbox.uncheck();
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await navigateToYoutubeStep(videoPage);

  await test.step('Verify secondary seconds buttons are not present', async () => {
    const { secondaryForwardButton, secondaryRewindButton } =
      getVideoLocatorElements(videoPage);

    await expect(secondaryRewindButton).not.toBeVisible();
    await expect(secondaryForwardButton).not.toBeVisible();
  });
});

test('should toggle secondary seconds buttons dynamically', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  const optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);

  await navigateToOptionsPageStep(optionPage, optionFilePath);

  await test.step('Enable secondary seconds buttons', async () => {
    const { enableMoreButtonsCheckbox } = getOptionsInputs(optionPage);

    await enableMoreButtonsCheckbox.check();
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await navigateToYoutubeStep(videoPage);

  await test.step('Verify secondary seconds buttons are present', async () => {
    const { secondaryForwardButton, secondaryRewindButton } =
      getVideoLocatorElements(videoPage);

    await expect(secondaryRewindButton).toBeVisible();
    await expect(secondaryForwardButton).toBeVisible();
  });

  await test.step('Disable secondary seconds buttons', async () => {
    const optionPage = await context.newPage();
    await optionPage.goto(optionFilePath);

    const { enableMoreButtonsCheckbox } = getOptionsInputs(optionPage);

    await enableMoreButtonsCheckbox.uncheck();
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await test.step('Verify secondary seconds buttons are not present', async () => {
    const { secondaryForwardButton, secondaryRewindButton } =
      getVideoLocatorElements(videoPage);

    await expect(secondaryRewindButton).not.toBeVisible();
    await expect(secondaryForwardButton).not.toBeVisible();
  });
});

test('should show the correct title for the secondary buttons when hover', async ({
  page: videoPage,
  context,
  extensionId,
}) => {
  const optionPage = await context.newPage();
  const optionFilePath = await getOptionFilePath(extensionId);

  await navigateToOptionsPageStep(optionPage, optionFilePath);

  await test.step('Enable secondary seconds buttons and set values', async () => {
    const {
      enableMoreButtonsCheckbox,
      rewindSecondaryInput,
      forwardSecondaryInput,
    } = getOptionsInputs(optionPage);

    await enableMoreButtonsCheckbox.check();
    await rewindSecondaryInput.fill('15');
    await forwardSecondaryInput.fill('20');
    await optionPage.locator(BUTTON_SUBMIT_SELECTOR).click();

    expect(optionPage.isClosed()).toBe(true);
  });

  await navigateToYoutubeStep(videoPage);

  await test.step('Verify secondary buttons show correct titles and aria-labels', async () => {
    const { secondaryForwardButton, secondaryRewindButton } =
      getVideoLocatorElements(videoPage);

    expect(await secondaryForwardButton.getAttribute('aria-label')).toBe(
      'Go forward 20 seconds'
    );
    expect(await secondaryForwardButton.getAttribute('title')).toBe(
      'Go forward 20 seconds'
    );

    expect(await secondaryRewindButton.getAttribute('aria-label')).toBe(
      'Go back 15 seconds'
    );
    expect(await secondaryRewindButton.getAttribute('title')).toBe(
      'Go back 15 seconds'
    );
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
