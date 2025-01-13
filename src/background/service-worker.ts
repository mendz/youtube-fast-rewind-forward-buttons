chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  const currentVersion = chrome.runtime.getManifest().version;
  const isUpdate =
    reason === chrome.runtime.OnInstalledReason.UPDATE &&
    previousVersion === '1.3.0' &&
    previousVersion !== currentVersion;

  console.info(`Previous Version: ${previousVersion}`);
  console.info(`Current Version: ${currentVersion}`);

  if (isUpdate) {
    showReadme();
  }
});

function showReadme() {
  chrome.tabs.create({
    url: chrome.runtime.getURL(
      '/background/whats-new-page/whats-new-page.html'
    ),
  });
}
