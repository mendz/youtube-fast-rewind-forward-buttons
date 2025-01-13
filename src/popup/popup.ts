function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

document.querySelector('button')?.addEventListener('click', openOptionsPage);
