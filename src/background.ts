// because Youtube is a SPA, we need to detect url changes and re-run the code
chrome.webNavigation.onHistoryStateUpdated.addListener((e) => {
  // send a message to content.js that the URL has changed
  chrome.tabs.sendMessage(e.tabId, { message: 'urlChanged' });
});
