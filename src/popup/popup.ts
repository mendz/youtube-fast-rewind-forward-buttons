const WHATS_NEW_PAGE_URL = '/background/whats-new-page/whats-new-page.html';

function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

document.querySelector('button')?.addEventListener('click', openOptionsPage);

document.getElementById('whats-new-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL(WHATS_NEW_PAGE_URL) });
});
