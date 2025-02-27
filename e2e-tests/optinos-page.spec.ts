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

test('should have 4 inputs', async ({ page }) => {
  const locateInputs = page.locator('input');
  const inputs = await locateInputs.all();
  expect(inputs.length).toBe(4);
});

test('should have the default values', async ({ page }) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
  } = getOptionsInputs(page);
  expect(rewindSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.rewindSecondsInput
  );
  expect(forwardSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.forwardSecondsInput
  );
  expect(shouldOverrideArrowKeysCheckbox).not.toBeChecked();
  expect(shouldOverrideMediaKeysCheckbox).not.toBeChecked();
});

test('should reset all input values when pressing the button and accept the alert', async ({
  page,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
  } = getOptionsInputs(page);

  await test.step('Fill the input values', async () => {
    await fillInputsWithChangedValues(
      rewindSecondsInput,
      forwardSecondsInput,
      shouldOverrideArrowKeysCheckbox,
      shouldOverrideMediaKeysCheckbox
    );

    expect(rewindSecondsInput).toHaveValue(
      OPTIONS_CHANGED_VALUES.rewindSecondsInput
    );
    expect(forwardSecondsInput).toHaveValue(
      OPTIONS_CHANGED_VALUES.forwardSecondsInput
    );
    expect(shouldOverrideArrowKeysCheckbox).toBeChecked();
    expect(shouldOverrideMediaKeysCheckbox).toBeChecked();
  });

  await test.step('Reset the values', async () => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('button#reset-values').click();

    expect(rewindSecondsInput).toHaveValue(
      OPTIONS_DEFAULT_VALUES.rewindSecondsInput
    );
    expect(forwardSecondsInput).toHaveValue(
      OPTIONS_DEFAULT_VALUES.forwardSecondsInput
    );
    expect(shouldOverrideArrowKeysCheckbox).not.toBeChecked();
    expect(shouldOverrideMediaKeysCheckbox).not.toBeChecked();
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
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox
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
});

test('should keep the values after pressing the submit button and return to the page', async ({
  page,
  extensionId,
  context,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox
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
  } = getOptionsInputs(newPage);
  expect(newPageRewindSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.rewindSecondsInput
  );
  expect(newPageForwardSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.forwardSecondsInput
  );
  expect(newPageShouldOverrideKeysCheckbox).toBeChecked();
  expect(newPageShouldOverrideMediaKeysCheckbox).toBeChecked();
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
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox
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
  } = getOptionsInputs(newPage);
  expect(newPageRewindSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.rewindSecondsInput
  );
  expect(newPageForwardSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.forwardSecondsInput
  );
  expect(newPageShouldOverrideKeysCheckbox).not.toBeChecked();
  expect(newPageShouldOverrideMediaKeysCheckbox).not.toBeChecked();
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

test('should keep the old value when user enters a value above 7200', async ({
  page,
}) => {
  const { rewindSecondsInput, forwardSecondsInput } = getOptionsInputs(page);

  await rewindSecondsInput.fill('5');
  await forwardSecondsInput.fill('5');

  await rewindSecondsInput.fill('7201');
  await expect(rewindSecondsInput).toHaveValue('5');

  await forwardSecondsInput.fill('7201');
  await expect(forwardSecondsInput).toHaveValue('5');
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

  // Use 7199 which is within the maximum allowed value (7200)
  await rewindSecondsInput.fill('7199');
  await expect(rewindOutput).toHaveText('(1h 59m 59s)');
});
