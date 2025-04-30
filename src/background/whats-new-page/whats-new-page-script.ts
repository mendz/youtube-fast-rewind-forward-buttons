import { versionUpdates } from './whats-new-data';

interface IUpdates {
  title: string;
  description: string;
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
  const html = updates
    .reverse()
    .map(
      (versionUpdate) => /* html */ `
        <article>
          <h3 class="version-date">${versionUpdate.version} - ${
            versionUpdate.date
          }</h3>
          ${versionUpdate.updates
            .map((update) => renderUpdate(update))
            .join('\n')}
        </article>
    `
    )
    .join('<hr/>');
  updatesElement.innerHTML = html;
}

export function renderUpdate(update: IUpdates): string {
  return /* html */ `
    <div class="update">
      <h4>${update.title}</h4>
      <p>${update.description}</p>
    </div>
    `;
}
