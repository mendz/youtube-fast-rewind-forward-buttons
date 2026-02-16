export const YouTubeSelectors = {
  Player: {
    VIDEO: 'video',
    SCOPED_VIDEO: 'ytd-player video, div.ytd-player video',
    CONTAINER_ELEMENT: 'ytd-player',
    CONTAINER_CLASS: 'div.ytd-player',
    CONTROLS_LEFT: 'div.ytp-left-controls',
    NEXT_BUTTON: 'a.ytp-next-button',
    PLAY_BUTTON: 'button.ytp-play-button',
    MUTE_BUTTON: '.ytp-mute-button',
    VOLUME_AREA: '.ytp-volume-area',
    NEW_UI_FLAG: '.ytp-delhi-modern',
    CHROME_BOTTOM: 'div.ytp-chrome-bottom',
  },
  Tooltip: {
    WRAPPER: 'div.ytp-tooltip-text-wrapper',
    TEXT: 'span.ytp-tooltip-text',
  },
} as const;
