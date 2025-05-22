chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  const currentVersion = chrome.runtime.getManifest().version;
  const isUpdate =
    reason === chrome.runtime.OnInstalledReason.UPDATE &&
    previousVersion === '1.4.0';

  console.info(`Previous Version: ${previousVersion}`);
  console.info(`Current Version: ${currentVersion}`);

  if (isUpdate) {
    openWhatsNewPage();
  }
});

export function openWhatsNewPage() {
  const WHATS_NEW_PAGE_URL = '/background/whats-new-page/whats-new-page.html';
  chrome.tabs.create({
    url: chrome.runtime.getURL(WHATS_NEW_PAGE_URL),
  });
}
