chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('../changelog/index.html'),
      selected: true,
    });
  }
});
