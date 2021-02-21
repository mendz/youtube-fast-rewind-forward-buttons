// because YouTube is a SPA, we need to check if there is a video in the page in every change in the URL
chrome.webNavigation.onHistoryStateUpdated.addListener((e) => {
  // send a message to content.js that the URL has changed
  chrome.tabs.sendMessage(e.tabId, { message: 'urlChanged' });
});
