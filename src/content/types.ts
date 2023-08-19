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

export const KEY_CODES: { [key in ArrowKey]: number } = {
  [ArrowKey.ARROW_LEFT_KEY]: 37,
  [ArrowKey.ARROW_RIGHT_KEY]: 39,
};

export const ALL_KEY_CODES: ArrowKey[] = [
  ArrowKey.ARROW_LEFT_KEY,
  ArrowKey.ARROW_RIGHT_KEY,
];

export enum ButtonClassesIds {
  CLASS = `ml-custom-rewind-forward-buttons`,
  REWIND_ID = 'ml-custom-rewind-button',
  FORWARD_ID = 'ml-custom-forward-button',
}
