import { expect } from '@playwright/test';
import {
  fillInputsWithChangedValues,
  getOptionFilePath,
  getOptionsInputs,
  OPTIONS_CHANGED_VALUES,
  OPTIONS_DEFAULT_VALUES,
  test,
  BUTTON_SUBMIT_SELECTOR,
} from './helpers';

test.beforeEach(async ({ page, extensionId }) => {
  const optionFilePath = await getOptionFilePath(extensionId);
  await page.goto(optionFilePath);
});

test('should have 5 inputs', async ({ page }) => {
  const locateInputs = page.locator('input');
  const inputs = await locateInputs.all();
  expect(inputs.length).toBe(5);
});

test('should have the default values', async ({ page }) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    shouldShowButtonsTooltipCheckbox,
  } = getOptionsInputs(page);
  expect(rewindSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.rewindSecondsInput
  );
  expect(forwardSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.forwardSecondsInput
  );
  expect(shouldOverrideArrowKeysCheckbox).not.toBeChecked();
  expect(shouldOverrideMediaKeysCheckbox).not.toBeChecked();
  expect(shouldShowButtonsTooltipCheckbox).toBeChecked();
});

test('should reset all input values when pressing the button and accept the alert', async ({
  page,
}) => {
  const {
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    shouldShowButtonsTooltipCheckbox,
  } = getOptionsInputs(page);

  await test.step('Fill the input values', async () => {
    await fillInputsWithChangedValues(
      rewindSecondsInput,
      forwardSecondsInput,
      shouldOverrideArrowKeysCheckbox,
      shouldOverrideMediaKeysCheckbox,
      shouldShowButtonsTooltipCheckbox
    );

    expect(rewindSecondsInput).toHaveValue(
      OPTIONS_CHANGED_VALUES.rewindSecondsInput
    );
    expect(forwardSecondsInput).toHaveValue(
      OPTIONS_CHANGED_VALUES.forwardSecondsInput
    );
    expect(shouldOverrideArrowKeysCheckbox).toBeChecked();
    expect(shouldOverrideMediaKeysCheckbox).toBeChecked();
    expect(shouldShowButtonsTooltipCheckbox).not.toBeChecked();
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
    expect(shouldShowButtonsTooltipCheckbox).toBeChecked();
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
    shouldShowButtonsTooltipCheckbox,
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    shouldShowButtonsTooltipCheckbox
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
  expect(shouldShowButtonsTooltipCheckbox).toBeChecked();
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
    shouldShowButtonsTooltipCheckbox,
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    shouldShowButtonsTooltipCheckbox
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
    shouldShowButtonsTooltipCheckbox: newPageShouldShowButtonsTooltipCheckbox,
  } = getOptionsInputs(newPage);
  expect(newPageRewindSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.rewindSecondsInput
  );
  expect(newPageForwardSecondsInput).toHaveValue(
    OPTIONS_CHANGED_VALUES.forwardSecondsInput
  );
  expect(newPageShouldOverrideKeysCheckbox).toBeChecked();
  expect(newPageShouldOverrideMediaKeysCheckbox).toBeChecked();
  expect(newPageShouldShowButtonsTooltipCheckbox).not.toBeChecked();
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
    shouldShowButtonsTooltipCheckbox,
  } = getOptionsInputs(page);
  await fillInputsWithChangedValues(
    rewindSecondsInput,
    forwardSecondsInput,
    shouldOverrideArrowKeysCheckbox,
    shouldOverrideMediaKeysCheckbox,
    shouldShowButtonsTooltipCheckbox
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
    shouldShowButtonsTooltipCheckbox: newPageShouldShowButtonsTooltipCheckbox,
  } = getOptionsInputs(newPage);
  expect(newPageRewindSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.rewindSecondsInput
  );
  expect(newPageForwardSecondsInput).toHaveValue(
    OPTIONS_DEFAULT_VALUES.forwardSecondsInput
  );
  expect(newPageShouldOverrideKeysCheckbox).not.toBeChecked();
  expect(newPageShouldOverrideMediaKeysCheckbox).not.toBeChecked();
  expect(newPageShouldShowButtonsTooltipCheckbox).toBeChecked();
});
