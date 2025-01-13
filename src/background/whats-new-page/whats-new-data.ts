import { IVersionUpdates } from './whats-new-page-script';

export const versionUpdates: IVersionUpdates[] = [
  {
    version: '1.3.2',
    date: getDate('2024-10-20'),
    updates: [
      {
        title: 'New way to open the options page',
        description:
          'Now you can click on the extension icon in the top right corner. This will open a popup with a button that will open the options page.',
      },
    ],
  },
];

function getDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IL', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}
