import { expect, Locator, Page } from '@playwright/test';
import { getOptionFileName, test } from './helpers';

const DEFAULT_VALUES = {
  rewindSecondsInput: '5',
  forwardSecondsInput: '5',
  shouldOverrideKeysCheckbox: false,
};

const CHANGED_VALUES = {
  rewindSecondsInput: '40',
  forwardSecondsInput: '50',
  shouldOverrideKeysCheckbox: true,
};

test.beforeEach(async ({ page, extensionId }) => {
  const optionFileName = await getOptionFileName();
  await page.goto(`chrome-extension://${extensionId}/${optionFileName}`);
});

test('should have the default values', async ({ page }) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideKeysCheckbox,
  } = getOptionsInputs(page);
  expect(rewindSecondsInput).toHaveValue(DEFAULT_VALUES.rewindSecondsInput);
  expect(forwardSecondsInput).toHaveValue(DEFAULT_VALUES.forwardSecondsInput);
  expect(shouldOverrideKeysCheckbox).not.toBeChecked();
});

test('should reset all input values when pressing the button and accept the alert', async ({
  page,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideKeysCheckbox,
  } = getOptionsInputs(page);
  await test.step('Fill the input values', async () => {
    await fillInputsWithChangedValues(
      rewindSecondsInput,
      forwardSecondsInput,
      shouldOverrideKeysCheckbox
    );
    expect(rewindSecondsInput).toHaveValue(CHANGED_VALUES.rewindSecondsInput);
    expect(forwardSecondsInput).toHaveValue(CHANGED_VALUES.forwardSecondsInput);
    expect(shouldOverrideKeysCheckbox).toBeChecked();
  });

  await test.step('Reset the values', async () => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('button#reset-values').click();
    expect(rewindSecondsInput).toHaveValue(DEFAULT_VALUES.rewindSecondsInput);
    expect(forwardSecondsInput).toHaveValue(DEFAULT_VALUES.forwardSecondsInput);
    expect(shouldOverrideKeysCheckbox).not.toBeChecked();
  });
});

test('should NOT reset all input values when pressing the button and dismiss the alert', async ({
  page,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideKeysCheckbox,
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideKeysCheckbox
  );
  page.on('dialog', (dialog) => dialog.dismiss());
  await page.locator('button#reset-values').click();
  expect(rewindSecondsInput).toHaveValue(CHANGED_VALUES.rewindSecondsInput);
  expect(forwardSecondsInput).toHaveValue(CHANGED_VALUES.forwardSecondsInput);
  expect(shouldOverrideKeysCheckbox).toBeChecked();
});

test('should keep the values after pressing the submit button and return to the page', async ({
  page,
  extensionId,
  context,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideKeysCheckbox,
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideKeysCheckbox
  );
  const newPage = await context.newPage();
  await page.locator('button[type="submit"]').click();

  const optionFileName = await getOptionFileName();
  await newPage.goto(`chrome-extension://${extensionId}/${optionFileName}`);

  const {
    rewindSecondsInput: newPageRewindSecondsInput,
    forwardSecondsInput: newPageForwardSecondsInput,
    shouldOverrideKeysCheckbox: newPageShouldOverrideKeysCheckbox,
  } = getOptionsInputs(newPage);
  expect(newPageRewindSecondsInput).toHaveValue(
    CHANGED_VALUES.rewindSecondsInput
  );
  expect(newPageForwardSecondsInput).toHaveValue(
    CHANGED_VALUES.forwardSecondsInput
  );
  expect(newPageShouldOverrideKeysCheckbox).toBeChecked();
});

test('should NOT keep the values if user close the page and return to the back to it', async ({
  page,
  extensionId,
  context,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideKeysCheckbox,
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideKeysCheckbox
  );
  const newPage = await context.newPage();
  await page.close();

  const optionFileName = await getOptionFileName();
  await newPage.goto(`chrome-extension://${extensionId}/${optionFileName}`);

  const {
    rewindSecondsInput: newPageRewindSecondsInput,
    forwardSecondsInput: newPageForwardSecondsInput,
    shouldOverrideKeysCheckbox: newPageShouldOverrideKeysCheckbox,
  } = getOptionsInputs(newPage);
  expect(newPageRewindSecondsInput).toHaveValue(
    DEFAULT_VALUES.rewindSecondsInput
  );
  expect(newPageForwardSecondsInput).toHaveValue(
    DEFAULT_VALUES.forwardSecondsInput
  );
  expect(newPageShouldOverrideKeysCheckbox).not.toBeChecked();
});

async function fillInputsWithChangedValues(
  rewindSecondsInput: Locator,
  forwardSecondsInput: Locator,
  shouldOverrideKeysCheckbox: Locator
) {
  await rewindSecondsInput.fill(CHANGED_VALUES.rewindSecondsInput);
  await forwardSecondsInput.fill(CHANGED_VALUES.forwardSecondsInput);
  await shouldOverrideKeysCheckbox.check();
}

function getOptionsInputs(page: Page) {
  const rewindSecondsInput = page.locator('input#rewind');
  const forwardSecondsInput = page.locator('input#forward');
  const shouldOverrideKeysCheckbox = page.locator('input#override-keys');
  return {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideKeysCheckbox,
  };
}
