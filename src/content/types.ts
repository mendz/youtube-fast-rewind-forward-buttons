export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface IOptions {
  rewindSeconds: number;
  forwardSeconds: number;
  secondarySeconds: {
    checkboxIsEnabled: boolean;
    rewindSeconds: number;
    forwardSeconds: number;
  };
  shouldOverrideKeys?: boolean; // TODO: old one, should removed in the next version
  shouldOverrideArrowKeys: boolean;
  shouldOverrideMediaKeys: boolean;
}

export interface IStorageOptions
  extends Omit<
    IOptions,
    'rewindSeconds' | 'forwardSeconds' | 'secondarySeconds'
  > {
  rewindSeconds: string;
  forwardSeconds: string;
  secondarySeconds: {
    checkboxIsEnabled: boolean;
    rewindSeconds: string;
    forwardSeconds: string;
  };
}

export enum ArrowKey {
  ARROW_LEFT_KEY = 'ArrowLeft',
  ARROW_RIGHT_KEY = 'ArrowRight',
}

export enum MediaTrackKey {
  MEDIA_TRACK_PREVIOUS = 'MediaTrackPrevious',
  MEDIA_TRACK_NEXT = 'MediaTrackNext',
}

export type CreateButtonArg = {
  svg: string;
  title: string;
  id?: string;
};

export type VideoTimeArg = {
  seconds: number;
  video: HTMLVideoElement;
  updateType: ArrowKey;
};

export type ButtonExtraStylesArg = {
  svgClasses: string[];
  svgPathClasses: string[];
  svgUseHtml: string;
};

export const KEY_CODES: { [key in ArrowKey | MediaTrackKey]: number } = {
  [ArrowKey.ARROW_LEFT_KEY]: 37,
  [ArrowKey.ARROW_RIGHT_KEY]: 39,
  [MediaTrackKey.MEDIA_TRACK_PREVIOUS]: 177,
  [MediaTrackKey.MEDIA_TRACK_NEXT]: 176,
};

export const ALL_ARROW_KEY_CODES: ArrowKey[] = [
  ArrowKey.ARROW_LEFT_KEY,
  ArrowKey.ARROW_RIGHT_KEY,
];

export enum ButtonClassesIds {
  CLASS = `ml-custom-rewind-forward-buttons`,
  REWIND_ID = 'ml-custom-rewind-button',
  FORWARD_ID = 'ml-custom-forward-button',
}

export type ChromeStorageChanges = {
  [key: string]: chrome.storage.StorageChange;
};
