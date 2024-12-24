interface IUpdates {
  title: string;
  description: string;
}

export interface IVersionUpdates {
  version: string;
  date: string;
  updates: IUpdates[];
}

export const versionUpdates: IVersionUpdates[] = [
  {
    version: '1.3.1',
    date: getDate('2024-08-13'),
    updates: [
      {
        title: 'New way to open the options page',
        description:
          'Now you can click on the extension icon in the top right corner. This will open a popup with a button that will open the options page.',
      },
      {
        title: 'Support Buttons Added',
        description: `We've added two new buttons in the options page and the new popup to make it easier for you to support the
        development of this extension.`,
      },
    ],
  },
];

document.addEventListener('DOMContentLoaded', () => {
  setUpdates();
});

export function getDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IL', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function setUpdates(updates: IVersionUpdates[] = versionUpdates) {
  const updatesElement = document.getElementById('updates') as HTMLDivElement;
  const html = updates
    .reverse()
    .map(
      (versionUpdate) => /* html */ `
        <h3 class="version-date">${versionUpdate.version} - ${
          versionUpdate.date
        }</h3>
        ${versionUpdate.updates
          .map((update) => renderUpdate(update))
          .join('\n')}
    `
    )
    .join('\n');
  updatesElement.innerHTML = html;
}

export function renderUpdate(update: IUpdates): string {
  return /* html */ `
    <div class="card">
      <h3>${update.title}</h3>
      <p>${update.description}</p>
    </div>
    `;
}
