import { versionUpdates } from './whats-new-data';

interface IUpdates {
  title: string;
  description: string;
  type?: 'new' | 'fixed' | 'improved';
}

export interface IVersionUpdates {
  version: string;
  date: string;
  updates: IUpdates[];
}

document.addEventListener('DOMContentLoaded', () => {
  setUpdates();
});

export function setUpdates(updates: IVersionUpdates[] = versionUpdates) {
  const updatesElement = document.getElementById('updates') as HTMLDivElement;
  // Find the latest version (by date, fallback to first if dates are equal)
  const sorted = [...updates].reverse();
  const latestVersion = sorted[0]?.version;
  const html = sorted
    .map(
      (versionUpdate) => /* html */ `
        <article ${versionUpdate.version === latestVersion ? ' class="latest"' : ''}>
          <h3 class="version-date">${versionUpdate.version} - ${versionUpdate.date}</h3>
          ${versionUpdate.updates.map((update) => renderUpdate(update)).join('')}
        </article>
      `
    )
    .join('');
  updatesElement.innerHTML = html;
}

export function renderUpdate(update: IUpdates): string {
  const badgeClass = update.type ? `badge badge-${update.type}` : 'badge';
  const badgeLabel = update.type ? capitalize(update.type) : '';
  return /* html */ `
    <div class="update">
      <h4>${update.title}</h4>
      <p>${update.description}</p>
      ${update.type ? `<span class="${badgeClass}">${badgeLabel}</span>` : ''}
    </div>
    `;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
