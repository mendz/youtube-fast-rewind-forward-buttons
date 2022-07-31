import { createFastRewindSVG, createFastForwardSVG } from '../helper';

export const HTML_PLAYER_FULL = `
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
export const SVG_CLASSES_MOCK = ['test-class'];
export const SVG_USE_HTML_MOCK =
  '<use class="ytp-svg-shadow" xlink:href="#ytp-id-45"></use>';
export const SVG_PATH_CLASSES_MOCK = ['path-test-class'];
export const X_LINK_ATTR = 'xlink:href';
export const TOOLTIP_CONTAINER_WRAPPER_QUERY = 'div.ytp-tooltip-text-wrapper';

export const DEFAULT_OPTIONS_MOCK = {
  forwardSeconds: 5,
  rewindSeconds: 5,
  shouldOverrideKeys: false,
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
