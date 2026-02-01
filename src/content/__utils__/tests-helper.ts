import { createFastRewindSVG, createFastForwardSVG } from '../helper';
import { IOptions } from '../types';

export const HTML_PLAYER_FULL = /* html */ `
<ytd-player>
    <div class="html5-video-container">
        <video class="video-stream html5-main-video" src="test"></video>
    </div>
    <div class="ytp-chrome-bottom">
        <div
            class="ytp-tooltip ytp-bottom ytp-preview ytp-has-duration ytp-text-detail"
            >
            <div class="ytp-tooltip-text-wrapper">
                <div class="ytp-tooltip-title"></div>
                <span class="ytp-tooltip-text ytp-tooltip-text-no-title"></span>
            </div>
            <div class="ytp-chrome-controls">
                <div class="ytp-left-controls">
                    <a class="ytp-next-button">
                        <svg>
                            <path class="ytp-svg-fill"></path>
                            <use></use>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</ytd-player>
`;

export const INITIAL_HTML_PLAYER_FULL = /* html */ `
<div class="ytd-player">
    <div class="html5-video-container">
        <!-- <video class="video-stream html5-main-video" src="test"></video> -->
    </div>
    <div class="ytp-chrome-bottom">
        <div
            class="ytp-tooltip ytp-bottom ytp-preview ytp-has-duration ytp-text-detail"
            >
            <div class="ytp-tooltip-text-wrapper">
                <div class="ytp-tooltip-title"></div>
                <span class="ytp-tooltip-text ytp-tooltip-text-no-title"></span>
            </div>
            <div class="ytp-chrome-controls">
                <div class="ytp-left-controls">
                    <a class="ytp-next-button">
                        <svg>
                            <path class="ytp-svg-fill"></path>
                            <use></use>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
`;

/**
 * Full player with div.ytd-player container (for waitForPlayerElements / selectors that use CONTAINER_CLASS).
 * Same structure as INITIAL_HTML_PLAYER_FULL but with video present.
 */
export const HTML_PLAYER_READY = /* html */ `
<div class="ytd-player">
    <div class="html5-video-container">
        <video class="video-stream html5-main-video" src="test"></video>
    </div>
    <div class="ytp-chrome-bottom">
        <div
            class="ytp-tooltip ytp-bottom ytp-preview ytp-has-duration ytp-text-detail"
            >
            <div class="ytp-tooltip-text-wrapper">
                <div class="ytp-tooltip-title"></div>
                <span class="ytp-tooltip-text ytp-tooltip-text-no-title"></span>
            </div>
            <div class="ytp-chrome-controls">
                <div class="ytp-left-controls">
                    <a class="ytp-next-button">
                        <svg>
                            <path class="ytp-svg-fill"></path>
                            <use></use>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
`;

/** Minimal DOM with no player; for tests that expect waitForPlayerElements to fail. */
export const HTML_MINIMAL_NO_PLAYER = '<div></div>';

/** Player container with video only (no controls). */
export const HTML_PLAYER_VIDEO_ONLY = /* html */ `
<div class="ytd-player">
    <div class="html5-video-container">
        <video class="video-stream html5-main-video" src="test"></video>
    </div>
</div>
`;

/** Player with left-controls containing only play button (no next button). */
export const HTML_PLAYER_PLAY_BUTTON_ONLY = /* html */ `
<div class="ytd-player">
    <div class="html5-video-container">
        <video class="video-stream html5-main-video" src="test"></video>
    </div>
    <div class="ytp-left-controls">
        <button class="ytp-play-button"></button>
    </div>
</div>
`;

/** Player with left-controls but no next/play anchor button. */
export const HTML_PLAYER_CONTROLS_NO_ANCHOR = /* html */ `
<div class="ytd-player">
    <div class="html5-video-container">
        <video class="video-stream html5-main-video" src="test"></video>
    </div>
    <div class="ytp-left-controls"></div>
</div>
`;

const HTML_PLAYER_NEW_UI = /* html */ `
<div class="ytp-delhi-modern">
  <div class="ytp-chrome-controls">
    <div class="ytp-left-controls">
      <div class="ytp-volume-area">
        <button class="ytp-mute-button ytp-button"></button>
      </div>
    </div>
  </div>
</div>
`;

export const SVG_CLASSES_MOCK = ['test-class'];
export const SVG_FORWARD_USE_HTML_MOCK =
  '<use class="ytp-svg-shadow" xlink:href="#custom-path-fast-forward"></use>';
export const SVG_REWIND_USE_HTML_MOCK =
  '<use class="ytp-svg-shadow" xlink:href="#custom-path-rewind"></use>';
export const SVG_DOUBLE_FORWARD_USE_HTML_MOCK =
  '<use class="ytp-svg-shadow" xlink:href="#custom-path-double-forward"></use>';
export const SVG_DOUBLE_REWIND_USE_HTML_MOCK =
  '<use class="ytp-svg-shadow" xlink:href="#custom-path-double-rewind"></use>';
export const SVG_PATH_CLASSES_MOCK = ['path-test-class'];
export const X_LINK_ATTR = 'xlink:href';

export const DEFAULT_OPTIONS_MOCK: IOptions = {
  forwardSeconds: 5,
  rewindSeconds: 5,
  shouldOverrideArrowKeys: false,
  shouldOverrideMediaKeys: false,
  secondarySeconds: {
    checkboxIsEnabled: false,
    rewindSeconds: 5,
    forwardSeconds: 5,
  },
};

export function removeSpaces(text: string) {
  return text
    .trim()
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/\s+/gm, ' ');
}

export function createSvgMock(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[],
  type: 'getFastRewindSVG' | 'getFastForwardSVG'
): SVGSVGElement {
  let newSvg = '';
  if (type === 'getFastRewindSVG') {
    newSvg = createFastRewindSVG(svgClasses, svgUseHtml, svgPathClasses);
  } else {
    newSvg = createFastForwardSVG(svgClasses, svgUseHtml, svgPathClasses);
  }
  document.body.innerHTML = newSvg;
  return document.querySelector('svg') as SVGSVGElement;
}

export function createNewUiPlayerMarkup(): void {
  document.body.innerHTML = HTML_PLAYER_NEW_UI;
}
