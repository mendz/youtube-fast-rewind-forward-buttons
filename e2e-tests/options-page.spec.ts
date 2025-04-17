import { expect } from '@playwright/test';
import {
  BUTTON_SUBMIT_SELECTOR,
  fillInputsWithChangedValues,
  getOptionFilePath,
  getOptionsInputs,
  getShadowHostSupportLinks,
  OPTIONS_CHANGED_VALUES,
  OPTIONS_DEFAULT_VALUES,
  test,
} from './helpers';

test.beforeEach(async ({ page, extensionId }) => {
  const optionFilePath = await getOptionFilePath(extensionId);
  await page.goto(optionFilePath);
});

test('should have 7 inputs', async ({ page }) => {
  const locateInputs = page.locator('input');
  const inputs = await locateInputs.all();
  expect(inputs.length).toBe(7);
});

test('should have the default values', async ({ page }) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    rewindSecondaryInput,
    forwardSecondaryInput,
    rewindSecondaryOutput,
    forwardSecondaryOutput,
  } = getOptionsInputs(page);
  expect(rewindSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.rewindSecondsInput
  );
  expect(forwardSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.forwardSecondsInput
  );
  expect(shouldOverrideArrowKeysCheckbox).not.toBeChecked();
  expect(shouldOverrideMediaKeysCheckbox).not.toBeChecked();
  expect(rewindSecondaryInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.secondarySeconds.rewindSeconds
  );
  expect(rewindSecondaryOutput).toHaveText(
    `(${OPTIONS_DEFAULT_VALUES.secondarySeconds.rewindSeconds} seconds)`
  );
  expect(forwardSecondaryInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.secondarySeconds.forwardSeconds
  );
  expect(forwardSecondaryOutput).toHaveText(
    `(${OPTIONS_DEFAULT_VALUES.secondarySeconds.forwardSeconds} seconds)`
  );
});

test('should reset all input values when pressing the button and accept the alert', async ({
  page,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    rewindSecondaryInput,
    forwardSecondaryInput,
    enableMoreButtonsCheckbox,
    rewindSecondaryOutput,
    forwardSecondaryOutput,
  } = getOptionsInputs(page);

  await test.step('Fill the input values', async () => {
    await fillInputsWithChangedValues(
      rewindSecondsInput,
      forwardSecondsInput,
      shouldOverrideArrowKeysCheckbox,
      shouldOverrideMediaKeysCheckbox,
      false,
      {
        checkboxIsEnabledInput: enableMoreButtonsCheckbox,
        forwardSecondsInput: forwardSecondaryInput,
        rewindSecondsInput: rewindSecondaryInput,
      }
    );

    await expect(rewindSecondsInput).toHaveValue(
      OPTIONS_CHANGED_VALUES.rewindSecondsInput
    );
    await expect(forwardSecondsInput).toHaveValue(
      OPTIONS_CHANGED_VALUES.forwardSecondsInput
    );
    await expect(shouldOverrideArrowKeysCheckbox).toBeChecked();
    await expect(shouldOverrideMediaKeysCheckbox).toBeChecked();
    await expect(enableMoreButtonsCheckbox).toBeChecked();
    await expect(rewindSecondaryInput).toHaveValue(
      OPTIONS_CHANGED_VALUES.secondarySeconds.rewindSeconds
    );
    await expect(forwardSecondaryInput).toHaveValue(
      OPTIONS_CHANGED_VALUES.secondarySeconds.forwardSeconds
    );
  });

  await test.step('Reset the values', async () => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('button#reset-values').click();

    await expect(rewindSecondsInput).toHaveValue(
      OPTIONS_DEFAULT_VALUES.rewindSecondsInput
    );
    await expect(forwardSecondsInput).toHaveValue(
      OPTIONS_DEFAULT_VALUES.forwardSecondsInput
    );
    await expect(shouldOverrideArrowKeysCheckbox).not.toBeChecked();
    await expect(shouldOverrideMediaKeysCheckbox).not.toBeChecked();
    await expect(rewindSecondaryInput).toHaveValue(
      OPTIONS_DEFAULT_VALUES.secondarySeconds.rewindSeconds
    );
    await expect(rewindSecondaryOutput).toHaveText(
      `(${OPTIONS_DEFAULT_VALUES.secondarySeconds.rewindSeconds} seconds)`
    );
    await expect(forwardSecondaryInput).toHaveValue(
      OPTIONS_DEFAULT_VALUES.secondarySeconds.forwardSeconds
    );
    await expect(forwardSecondaryOutput).toHaveText(
      `(${OPTIONS_DEFAULT_VALUES.secondarySeconds.forwardSeconds} seconds)`
    );
  });
});

test('should NOT reset all input values when pressing the button and dismiss the alert', async ({
  page,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    rewindSecondaryInput,
    forwardSecondaryInput,
    rewindSecondaryOutput,
    forwardSecondaryOutput,
    enableMoreButtonsCheckbox,
  } = getOptionsInputs(page);

  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    false,
    {
      checkboxIsEnabledInput: enableMoreButtonsCheckbox,
      forwardSecondsInput: forwardSecondaryInput,
      rewindSecondsInput: rewindSecondaryInput,
    }
  );
  page.on('dialog', (dialog) => dialog.dismiss());
  await page.locator('button#reset-values').click();

  expect(rewindSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.rewindSecondsInput
  );
  expect(forwardSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.forwardSecondsInput
  );
  expect(shouldOverrideArrowKeysCheckbox).toBeChecked();
  expect(shouldOverrideMediaKeysCheckbox).toBeChecked();

  expect(enableMoreButtonsCheckbox).toBeChecked();
  expect(rewindSecondaryInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.secondarySeconds.rewindSeconds
  );
  expect(rewindSecondaryOutput).toHaveText(
    `(${OPTIONS_CHANGED_VALUES.secondarySeconds.rewindSeconds} seconds)`
  );
  expect(forwardSecondaryInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.secondarySeconds.forwardSeconds
  );
  expect(forwardSecondaryOutput).toHaveText(
    `(${OPTIONS_CHANGED_VALUES.secondarySeconds.forwardSeconds} seconds)`
  );
});

test('should keep the values after pressing the submit button and return to the page with smaller numbers', async ({
  page,
  extensionId,
  context,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    rewindSecondaryInput,
    forwardSecondaryInput,
    enableMoreButtonsCheckbox,
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    false,
    {
      checkboxIsEnabledInput: enableMoreButtonsCheckbox,
      forwardSecondsInput: forwardSecondaryInput,
      rewindSecondsInput: rewindSecondaryInput,
    }
  );

  const newPage = await context.newPage();
  await page.locator(BUTTON_SUBMIT_SELECTOR).click();

  expect(page.isClosed()).toBe(true);

  const optionFilePath = await getOptionFilePath(extensionId);
  await newPage.goto(optionFilePath);

  const {
    rewindSecondsInput: newPageRewindSecondsInput,
    forwardSecondsInput: newPageForwardSecondsInput,
    shouldOverrideArrowKeysCheckbox: newPageShouldOverrideKeysCheckbox,
    shouldOverrideMediaKeysCheckbox: newPageShouldOverrideMediaKeysCheckbox,
    rewindOutput,
    forwardOutput,
    rewindSecondaryInput: newPageRewindSecondaryInput,
    forwardSecondaryInput: newPageForwardSecondaryInput,
    rewindSecondaryOutput: newPageRewindSecondaryOutput,
    forwardSecondaryOutput: newPageForwardSecondaryOutput,
  } = getOptionsInputs(newPage);

  await expect(newPageRewindSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.rewindSecondsInput
  );
  await expect(rewindOutput).toHaveText('(40 seconds)');
  await expect(newPageForwardSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.forwardSecondsInput
  );
  await expect(forwardOutput).toHaveText('(50 seconds)');
  await expect(newPageShouldOverrideKeysCheckbox).toBeChecked();
  await expect(newPageShouldOverrideMediaKeysCheckbox).toBeChecked();
  await expect(newPageRewindSecondaryInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.secondarySeconds.rewindSeconds
  );
  await expect(newPageRewindSecondaryOutput).toHaveText(
    `(${OPTIONS_CHANGED_VALUES.secondarySeconds.rewindSeconds} seconds)`
  );
  await expect(newPageForwardSecondaryInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.secondarySeconds.forwardSeconds
  );
  await expect(newPageForwardSecondaryOutput).toHaveText(
    `(${OPTIONS_CHANGED_VALUES.secondarySeconds.forwardSeconds} seconds)`
  );
});

test('should keep the values after pressing the submit button and return to the page with large numbers', async ({
  page,
  extensionId,
  context,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    rewindSecondaryInput,
    forwardSecondaryInput,
    enableMoreButtonsCheckbox,
  } = getOptionsInputs(page);

  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    true,
    {
      checkboxIsEnabledInput: enableMoreButtonsCheckbox,
      forwardSecondsInput: forwardSecondaryInput,
      rewindSecondsInput: rewindSecondaryInput,
    }
  );

  const newPage = await context.newPage();
  await page.locator(BUTTON_SUBMIT_SELECTOR).click();

  expect(page.isClosed()).toBe(true);

  const optionFilePath = await getOptionFilePath(extensionId);
  await newPage.goto(optionFilePath);

  const {
    rewindSecondsInput: newPageRewindSecondsInput,
    forwardSecondsInput: newPageForwardSecondsInput,
    shouldOverrideArrowKeysCheckbox: newPageShouldOverrideKeysCheckbox,
    shouldOverrideMediaKeysCheckbox: newPageShouldOverrideMediaKeysCheckbox,
    rewindOutput,
    forwardOutput,
    rewindSecondaryInput: newPageRewindSecondaryInput,
    forwardSecondaryInput: newPageForwardSecondaryInput,
    rewindSecondaryOutput: newPageRewindSecondaryOutput,
    forwardSecondaryOutput: newPageForwardSecondaryOutput,
  } = getOptionsInputs(newPage);

  await expect(newPageRewindSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.complexRewindSecondsInput
  );
  await expect(rewindOutput).toHaveText('(1m 10s)');
  await expect(newPageForwardSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.complexForwardSecondsInput
  );
  await expect(forwardOutput).toHaveText('(1h 8m 41s)');
  await expect(newPageShouldOverrideKeysCheckbox).toBeChecked();
  await expect(newPageShouldOverrideMediaKeysCheckbox).toBeChecked();
  await expect(newPageRewindSecondaryInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.secondarySeconds.complexRewindSecondaryInput
  );
  await expect(newPageRewindSecondaryOutput).toHaveText('(1h 8m 41s)');
  await expect(newPageForwardSecondaryInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.secondarySeconds.complexForwardSecondaryInput
  );
  await expect(newPageForwardSecondaryOutput).toHaveText('(1h 8m 41s)');
});

test('should NOT keep the values if user close the page and return to the back to it', async ({
  page,
  extensionId,
  context,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    rewindSecondaryInput,
    forwardSecondaryInput,
    enableMoreButtonsCheckbox,
  } = getOptionsInputs(page);

  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    true,
    {
      checkboxIsEnabledInput: enableMoreButtonsCheckbox,
      forwardSecondsInput: forwardSecondaryInput,
      rewindSecondsInput: rewindSecondaryInput,
    }
  );

  const newPage = await context.newPage();
  await page.close();

  const optionFilePath = await getOptionFilePath(extensionId);
  await newPage.goto(optionFilePath);

  const {
    rewindSecondsInput: newPageRewindSecondsInput,
    forwardSecondsInput: newPageForwardSecondsInput,
    shouldOverrideArrowKeysCheckbox: newPageShouldOverrideKeysCheckbox,
    shouldOverrideMediaKeysCheckbox: newPageShouldOverrideMediaKeysCheckbox,
    rewindSecondaryInput: newPageRewindSecondaryInput,
    forwardSecondaryInput: newPageForwardSecondaryInput,
    enableMoreButtonsCheckbox: newPageEnableMoreButtonsCheckbox,
    rewindSecondaryOutput: newPageRewindSecondaryOutput,
    forwardSecondaryOutput: newPageForwardSecondaryOutput,
  } = getOptionsInputs(newPage);

  await expect(newPageRewindSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.rewindSecondsInput
  );
  await expect(newPageForwardSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.forwardSecondsInput
  );
  await expect(newPageShouldOverrideKeysCheckbox).not.toBeChecked();
  await expect(newPageShouldOverrideMediaKeysCheckbox).not.toBeChecked();
  await expect(newPageEnableMoreButtonsCheckbox).not.toBeChecked();
  await expect(newPageRewindSecondaryInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.secondarySeconds.rewindSeconds
  );
  await expect(newPageRewindSecondaryOutput).toHaveText(
    `(${OPTIONS_DEFAULT_VALUES.secondarySeconds.rewindSeconds} seconds)`
  );
  await expect(newPageForwardSecondaryInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.secondarySeconds.forwardSeconds
  );
  await expect(newPageForwardSecondaryOutput).toHaveText(
    `(${OPTIONS_DEFAULT_VALUES.secondarySeconds.forwardSeconds} seconds)`
  );
});

test('should open the by me coffee page when clicking on the buy me a coffee link', async ({
  page,
  context,
}) => {
  const shadowHost = await getShadowHostSupportLinks(page);
  const byMeCoffeeButton = shadowHost.locator(
    'a:has(img[alt="Buy Me A Coffee"])'
  );
  await expect(byMeCoffeeButton).toBeVisible();

  await byMeCoffeeButton.click();
  const newPage = await context.waitForEvent('page');

  expect(newPage).toHaveURL('https://buymeacoffee.com/leizerovich.mendy');
});

test('should open the the chrome extension page when clicking on the link', async ({
  page,
  context,
}) => {
  const shadowHost = await getShadowHostSupportLinks(page);
  const rateUsLink = shadowHost.locator('a#rate-us');
  await expect(rateUsLink).toBeVisible();

  await rateUsLink.click();
  const newPage = await context.waitForEvent('page');

  expect(newPage).toHaveURL(
    'https://chromewebstore.google.com/detail/youtube-rewind-fast-forwa/bmdiaadnpgbbfepggiiajgadlhhcphgk/reviews'
  );
});

test('should allow user to enter between 1-7200 seconds', async ({ page }) => {
  const { rewindSecondsInput, forwardSecondsInput } = getOptionsInputs(page);

  await rewindSecondsInput.fill('1');
  await expect(rewindSecondsInput).toHaveValue('1');

  await rewindSecondsInput.fill('7200');
  await expect(rewindSecondsInput).toHaveValue('7200');

  await forwardSecondsInput.fill('1');
  await expect(forwardSecondsInput).toHaveValue('1');

  await forwardSecondsInput.fill('7200');
  await expect(forwardSecondsInput).toHaveValue('7200');
});

test('should format the output text to seconds, minutes, and hours', async ({
  page,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    rewindOutput,
    forwardOutput,
  } = getOptionsInputs(page);

  await rewindSecondsInput.fill('5');
  await expect(rewindOutput).toHaveText('(5 seconds)');

  await rewindSecondsInput.fill('60');
  await expect(rewindOutput).toHaveText('(1 minute)');

  await rewindSecondsInput.fill('3600');
  await expect(rewindOutput).toHaveText('(1 hour)');

  await forwardSecondsInput.fill('5');
  await expect(forwardOutput).toHaveText('(5 seconds)');

  await forwardSecondsInput.fill('60');
  await expect(forwardOutput).toHaveText('(1 minute)');

  await forwardSecondsInput.fill('3600');
  await expect(forwardOutput).toHaveText('(1 hour)');
});

test('should not submit form when user enters a value below 1', async ({
  page,
}) => {
  const { rewindSecondsInput } = getOptionsInputs(page);

  await rewindSecondsInput.fill('10');
  await rewindSecondsInput.fill('0');

  await page.locator(BUTTON_SUBMIT_SELECTOR).click();

  expect(page.isClosed()).toBe(false);
});

test('should not submit form when user enters a value above 7200', async ({
  page,
}) => {
  const { rewindSecondsInput, forwardSecondsInput } = getOptionsInputs(page);

  await rewindSecondsInput.fill('7201');

  await page.locator(BUTTON_SUBMIT_SELECTOR).click();

  expect(page.isClosed()).toBe(false);

  await forwardSecondsInput.fill('7201');

  await page.locator(BUTTON_SUBMIT_SELECTOR).click();

  expect(page.isClosed()).toBe(false);
});

test('should handle singular and plural time units correctly', async ({
  page,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    rewindOutput,
    forwardOutput,
  } = getOptionsInputs(page);

  // Test single units
  await rewindSecondsInput.fill('1');
  await expect(rewindOutput).toHaveText('(1 second)');

  await rewindSecondsInput.fill('5');
  await expect(rewindOutput).toHaveText('(5 seconds)');

  await forwardSecondsInput.fill('60');
  await expect(forwardOutput).toHaveText('(1 minute)');

  await forwardSecondsInput.fill('3600');
  await expect(forwardOutput).toHaveText('(1 hour)');

  // Test composite units
  await rewindSecondsInput.fill('62');
  await expect(rewindOutput).toHaveText('(1m 2s)');

  await forwardSecondsInput.fill('3661');
  await expect(forwardOutput).toHaveText('(1h 1m 1s)');

  await rewindSecondsInput.fill('7313');
  await expect(rewindOutput).toHaveText('(2h 1m 53s)');
});
