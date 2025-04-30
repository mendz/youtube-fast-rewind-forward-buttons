import { IVersionUpdates } from './whats-new-page-script';

export const versionUpdates: IVersionUpdates[] = [
  {
    version: 'v1.4.0',
    date: getDate('2025-01-21'),
    updates: [
      {
        title: 'New way to open the options page',
        description:
          'Now, you can click on the extension icon in the top right corner to open a popup with a button that directs you to the options page.',
      },
      {
        title: 'Fixed comment changes affects the video playback.',
        description:
          'Fixed the issue where using the arrow key while adding a comment affects the video playback.',
      },
    ],
  },
];

export function getDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IL', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}
