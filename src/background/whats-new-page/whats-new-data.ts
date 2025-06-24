import { IVersionUpdates } from './whats-new-page-script';

export const versionUpdates: IVersionUpdates[] = [
  {
    version: 'v1.4.0',
    date: getDate('2025-01-21'),
    updates: [
      {
        title: 'Easier access to the options page',
        description:
          'Click the extension icon in the toolbar to open a popup with a button that takes you directly to the options page.',
        type: 'new',
      },
      {
        title: 'Fixed video playback interruption during comment editing',
        description:
          'Resolved an issue where pressing arrow keys while typing comments would interrupt video playback.',
        type: 'fixed',
      },
    ],
  },
  {
    version: 'v1.4.2',
    date: getDate('2025-06-25'),
    updates: [
      {
        title: 'Up to four buttons',
        description:
          'Added support for up to four customizable buttons on the player, each with its own time setting.',
        type: 'new',
      },
      {
        title: 'Extended rewind/forward range',
        description:
          'Expanded the rewind and forward button range from 1 to 7200 seconds.\nThe input now shows the equivalent time in minutes for clarity.',
        type: 'improved',
      },
      {
        title: 'Updated UI Styling',
        description: `Updated the appearance of player buttons to better align with YouTube's design.\nRefreshed the styles across the extension's pages.`,
        type: 'improved',
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
