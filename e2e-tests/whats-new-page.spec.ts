import { expect } from '@playwright/test';
import { versionUpdates } from '../src/background/whats-new-page/whats-new-data';
import {
  getShadowHostSupportLinks,
  getWhatsNewFilePath,
  test,
} from './helpers';

test.beforeEach(async ({ page, extensionId }) => {
  const whatsNewFilePath = await getWhatsNewFilePath(extensionId);
  await page.goto(whatsNewFilePath);
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

test('should render the amounts of list items per the version updates', async ({
  page,
}) => {
  const countUpdates = versionUpdates
    .map((dateUpdates) => dateUpdates.updates)
    .flat().length;

  const locateCards = page.locator('.card');
  const cards = await locateCards.all();

  expect(cards.length).toBe(countUpdates);

  const locateHeaders = page.locator('.card h4');
  const headers = await locateHeaders.all();
  const locateParagraphs = page.locator('.card p');
  const paragraphs = await locateParagraphs.all();

  expect(headers.length).toBe(countUpdates);
  expect(paragraphs.length).toBe(countUpdates);
});

test('should show the correct title', async ({ page }) => {
  const firstUpdate = versionUpdates.reverse().at(0);
  const titleText = await page.locator('h3.version-date').first().textContent();

  expect(titleText).toBe(`${firstUpdate?.version} - ${firstUpdate?.date}`);
});

// test('should include the correct text', async ({ page }) => {});

// test('should open the whats new page when update new version', async ({
//   page,
// }) => {});
