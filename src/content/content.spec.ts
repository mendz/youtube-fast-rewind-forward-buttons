import { chrome } from 'jest-chrome';
import {
  run,
  getFastRewindSVG,
  getFastForwardSVG,
  getRewindButtonTitle,
  getForwardButtonTitle,
  isShouldSkipOverrideKeys,
  createButton,
  getElementsForTooltipCalculation,
  getSeconds,
  handleArrowButtons,
  overrideArrowKeys,
  handleTooltipOnMouseOver,
  handleTooltipOnMouseLeave,
  loadOptions,
} from './content';
import { simulateKey, updateVideoTime } from './other';
import * as other from './other';
import { ArrowKey, ButtonClassesIds, KEY_CODES } from './types';

const HTML_PLAYER_FULL = `
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
const SVG_CLASSES = ['test-class'];
const SVG_USE_HTML =
  '<use class="ytp-svg-shadow" xlink:href="#ytp-id-45"></use>';
const SVG_PATH_CLASSES = ['path-test-class'];
const X_LINK_ATTR = 'xlink:href';
const TOOLTIP_CONTAINER_WRAPPER_QUERY = 'div.ytp-tooltip-text-wrapper';

const DEFAULT_OPTIONS = {
  forwardSeconds: 5,
  rewindSeconds: 5,
  shouldOverrideKeys: false,
};

function removeSpaces(text: string) {
  return text
    .trim()
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/\s+/gm, ' ');
}

function createSvg(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[],
  type: 'getFastRewindSVG' | 'getFastForwardSVG'
): SVGSVGElement {
  let newSvg = '';
  if (type === 'getFastRewindSVG') {
    newSvg = getFastRewindSVG(svgClasses, svgUseHtml, svgPathClasses);
  } else {
    newSvg = getFastForwardSVG(svgClasses, svgUseHtml, svgPathClasses);
  }
  document.body.innerHTML = newSvg;
  return document.querySelector('svg') as SVGSVGElement;
}

describe('full run', () => {
  it('should have 2 buttons', async () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    await run();
    expect(
      document.querySelectorAll('button.ml-custom-rewind-forward-buttons')
        ?.length
    ).toEqual(2);
  });
  it('should have no button when there is no video', async () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    document.querySelector('video')?.remove();
    await run();
    expect(
      document.querySelectorAll('button.ml-custom-rewind-forward-buttons')
        ?.length
    ).toEqual(0);
  });
});

describe('getFastRewindSVG', () => {
  const rewindSvg = `
    <svg class="" height="100%" width="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path class="" id="custom-path-rewind" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
    </svg>`;
  const xLinkAttrCustomId = '#custom-path-rewind';

  it('should return the correct svg', () => {
    const newSvg: string = getFastRewindSVG([], '', []);
    expect(removeSpaces(newSvg)).toBe(removeSpaces(rewindSvg));
  });
  it('should populate with svgClasses', () => {
    const svgElement = createSvg(SVG_CLASSES, '', [], 'getFastRewindSVG');

    expect(svgElement?.classList.contains(SVG_CLASSES[0])).toBeTruthy();
    expect(svgElement?.querySelector('path')?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('use')).toBeFalsy();
  });
  it('should populate with svgPathClasses', () => {
    const svgElement = createSvg([], '', SVG_PATH_CLASSES, 'getFastRewindSVG');

    expect(svgElement?.classList.length).toBeFalsy();
    expect(
      svgElement?.querySelector('path')?.classList.contains(SVG_PATH_CLASSES[0])
    ).toBeTruthy();
    expect(svgElement?.querySelector('use')).toBeFalsy();
  });
  it('should populate with svgUseHtml', () => {
    const svgElement = createSvg([], SVG_USE_HTML, [], 'getFastRewindSVG');

    expect(svgElement?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('path')?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('use')).toBeTruthy();
    expect(svgElement?.querySelector('use')?.getAttribute(X_LINK_ATTR)).toBe(
      xLinkAttrCustomId
    );
  });
  it('should populate with all values', () => {
    const svgElement = createSvg(
      SVG_CLASSES,
      SVG_USE_HTML,
      SVG_PATH_CLASSES,
      'getFastRewindSVG'
    );

    expect(svgElement?.classList.contains(SVG_CLASSES[0])).toBeTruthy();
    expect(
      svgElement?.querySelector('path')?.classList.contains(SVG_PATH_CLASSES[0])
    ).toBeTruthy();
    expect(svgElement?.querySelector('use')).toBeTruthy();
    expect(svgElement?.querySelector('use')?.getAttribute(X_LINK_ATTR)).toBe(
      xLinkAttrCustomId
    );
  });
});

describe('getFastForwardSVG', () => {
  const forwardSvg = `
    <svg class="" height="100%" width="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path class="" id="custom-path-fast-forward" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
    </svg>`;
  const xLinkAttrCustomId = '#custom-path-fast-forward';

  it('should return the correct svg', () => {
    const newSvg: string = getFastForwardSVG([], '', []);
    expect(removeSpaces(newSvg)).toBe(removeSpaces(forwardSvg));
  });
  it('should populate with svgClasses', () => {
    const svgElement = createSvg(SVG_CLASSES, '', [], 'getFastForwardSVG');

    expect(svgElement?.classList.contains(SVG_CLASSES[0])).toBeTruthy();
    expect(svgElement?.querySelector('path')?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('use')).toBeFalsy();
  });
  it('should populate with svgPathClasses', () => {
    const svgElement = createSvg([], '', SVG_PATH_CLASSES, 'getFastForwardSVG');

    expect(svgElement?.classList.length).toBeFalsy();
    expect(
      svgElement?.querySelector('path')?.classList.contains(SVG_PATH_CLASSES[0])
    ).toBeTruthy();
    expect(svgElement?.querySelector('use')).toBeFalsy();
  });
  it('should populate with svgUseHtml', () => {
    const svgElement = createSvg([], SVG_USE_HTML, [], 'getFastForwardSVG');

    expect(svgElement?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('path')?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('use')).toBeTruthy();
    expect(svgElement?.querySelector('use')?.getAttribute(X_LINK_ATTR)).toBe(
      xLinkAttrCustomId
    );
  });
  it('should populate with all values', () => {
    const svgElement = createSvg(
      SVG_CLASSES,
      SVG_USE_HTML,
      SVG_PATH_CLASSES,
      'getFastForwardSVG'
    );

    expect(svgElement?.classList.contains(SVG_CLASSES[0])).toBeTruthy();
    expect(
      svgElement?.querySelector('path')?.classList.contains(SVG_PATH_CLASSES[0])
    ).toBeTruthy();
    expect(svgElement?.querySelector('use')).toBeTruthy();
    expect(svgElement?.querySelector('use')?.getAttribute(X_LINK_ATTR)).toBe(
      xLinkAttrCustomId
    );
  });
});

describe('getRewindButtonTitle return the correct text', () => {
  const fullTextFiveSeconds = 'Go back 5 seconds (left arrow)';
  const fullTextTenSeconds = 'Go back 10 seconds (left arrow)';
  const shortTextTenSeconds = 'Go back 10 seconds';

  it('should return with 5 seconds without overrideArrowKeys', () => {
    const result: string = getRewindButtonTitle(5, false);
    expect(result).toBe(fullTextFiveSeconds);
  });
  it('should return with 5 seconds & with overrideArrowKeys', () => {
    const result: string = getRewindButtonTitle(5, true);
    expect(result).toBe(fullTextFiveSeconds);
  });
  it('should return with 10 seconds & with overrideArrowKeys', () => {
    const result: string = getRewindButtonTitle(10, true);
    expect(result).toBe(fullTextTenSeconds);
  });
  it('should return with 10 seconds & without overrideArrowKeys', () => {
    const result: string = getRewindButtonTitle(10, false);
    expect(result).toBe(shortTextTenSeconds);
  });
});

describe('getForwardButtonTitle return the correct text', () => {
  const fullTextFiveSeconds = 'Go forward 5 seconds (right arrow)';
  const fullTextTenSeconds = 'Go forward 10 seconds (right arrow)';
  const shortTextTenSeconds = 'Go forward 10 seconds';

  it('should return with 5 seconds without overrideArrowKeys', () => {
    const result: string = getForwardButtonTitle(5, false);
    expect(result).toBe(fullTextFiveSeconds);
  });
  it('should return with 5 seconds & with overrideArrowKeys', () => {
    const result: string = getForwardButtonTitle(5, true);
    expect(result).toBe(fullTextFiveSeconds);
  });
  it('should return with 10 seconds & with overrideArrowKeys', () => {
    const result: string = getForwardButtonTitle(10, true);
    expect(result).toBe(fullTextTenSeconds);
  });
  it('should return with 10 seconds & without overrideArrowKeys', () => {
    const result: string = getForwardButtonTitle(10, false);
    expect(result).toBe(shortTextTenSeconds);
  });
});

describe('isShouldSkipOverrideKeys', () => {
  it('should return true when not the correct key', () => {
    const result: boolean = isShouldSkipOverrideKeys(
      'mendy' as any,
      DEFAULT_OPTIONS
    );
    expect(result).toBe(true);
  });
  it('should return true when not shouldOverrideKeys', () => {
    const result: boolean = isShouldSkipOverrideKeys(
      ArrowKey.ARROW_LEFT_KEY,
      DEFAULT_OPTIONS
    );
    expect(result).toBe(true);
  });
  it('should return true when the correct key but 5 seconds even should overrideArrowKeys', () => {
    const newOptions = {
      ...DEFAULT_OPTIONS,
      shouldOverrideKeys: true,
    };
    let result: boolean = isShouldSkipOverrideKeys(
      ArrowKey.ARROW_LEFT_KEY,
      newOptions
    );
    expect(result).toBe(true);
    result = isShouldSkipOverrideKeys(ArrowKey.ARROW_RIGHT_KEY, newOptions);
    expect(result).toBe(true);
  });
  it('should return false when the correct key but NOT 5 seconds and overrideArrowKeys', () => {
    const newOptions = {
      ...DEFAULT_OPTIONS,
      shouldOverrideKeys: true,
      rewindSeconds: 10,
    };
    let result: boolean = isShouldSkipOverrideKeys(
      ArrowKey.ARROW_LEFT_KEY,
      newOptions
    );
    expect(result).toBe(false);
    newOptions.forwardSeconds = 10;
    result = isShouldSkipOverrideKeys(ArrowKey.ARROW_RIGHT_KEY, newOptions);
    expect(result).toBe(false);
  });
});

describe('createButton', () => {
  const testTitle = 'test-title';
  const testSvg = '<svg></svg>';
  const testId = '123';

  it('should create button with the correct classes', () => {
    const newButton: HTMLButtonElement = createButton({
      title: testTitle,
      svg: testSvg,
    });
    expect(newButton.classList.contains('ytp-button')).toBeTruthy();
    expect(newButton.classList.contains(ButtonClassesIds.CLASS)).toBeTruthy();
  });
  it('should create button with the provided title', () => {
    const newButton: HTMLButtonElement = createButton({
      title: testTitle,
      svg: testSvg,
    });
    expect(newButton.title).toBe(testTitle);
    expect(newButton.getAttribute('aria-label')).toBe(testTitle);
  });
  it('should create button with the provided svg', () => {
    const newButton: HTMLButtonElement = createButton({
      title: testTitle,
      svg: testSvg,
    });
    expect(newButton.querySelector('svg')?.outerHTML).toBe(testSvg);
  });
  it('should create button with the provided id', () => {
    const newButton: HTMLButtonElement = createButton({
      title: testTitle,
      svg: testSvg,
      id: testId,
    });
    expect(newButton.id).toBe(testId);
  });
});

describe('getElementsForTooltipCalculation', () => {
  const wrapperQuery = TOOLTIP_CONTAINER_WRAPPER_QUERY;
  const wrapperParentQuery = 'div.ytp-tooltip';
  const tooltipContainerQuery = 'div.ytp-chrome-bottom';
  const spanTextQuery = 'span.ytp-tooltip-text';
  const error = `Couldn't find tooltip elements!`;

  it('should fail when no wrapper', () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    document.querySelector(wrapperQuery)?.remove();
    expect(getElementsForTooltipCalculation).toThrowError(error);
  });
  it('should fail when no wrapper parent', () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    const wrapper = document.querySelector(wrapperQuery)?.cloneNode() as Node;
    document.querySelector(wrapperParentQuery)?.remove();
    document.querySelector(tooltipContainerQuery)?.appendChild(wrapper);
    expect(getElementsForTooltipCalculation).toThrowError(error);
  });
  it('should return the tooltip elements', () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    const textWrapper = document.querySelector(wrapperQuery);
    const tooltipContainer = textWrapper?.parentElement;
    const tooltipTextSpan = textWrapper?.querySelector(spanTextQuery);
    const tooltipElements = {
      tooltipContainer,
      tooltipTextSpan,
    };
    const result = getElementsForTooltipCalculation();
    expect(result).toMatchObject(tooltipElements);
  });
});

describe('getSeconds', () => {
  it('should return 5 when wrong key', () => {
    const resultWrongUpdateType: number = getSeconds('test', DEFAULT_OPTIONS);
    expect(resultWrongUpdateType).toBe(5);
  });
  it('should return 10 for left key', () => {
    const newOptions = {
      ...DEFAULT_OPTIONS,
      rewindSeconds: 10,
    };
    const resultLeftKey: number = getSeconds(
      ArrowKey.ARROW_LEFT_KEY,
      newOptions
    );
    expect(resultLeftKey).toBe(10);
  });
  it('should return 20 for right key', () => {
    const newOptions = {
      ...DEFAULT_OPTIONS,
      forwardSeconds: 20,
    };
    const resultRightKey: number = getSeconds(
      ArrowKey.ARROW_RIGHT_KEY,
      newOptions
    );
    expect(resultRightKey).toBe(20);
  });
});

describe('simulateKey', () => {
  const leftKeyEvent = new KeyboardEvent('keydown', {
    key: ArrowKey.ARROW_LEFT_KEY,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
    which: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
  });
  const rightKeyEvent = new KeyboardEvent('keydown', {
    key: ArrowKey.ARROW_LEFT_KEY,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
    which: KEY_CODES[ArrowKey.ARROW_LEFT_KEY],
  });
  const originalBody = document.body;
  afterAll(() => {
    document.body = originalBody;
  });

  it('should dispatch the correct keyboard event ', () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    const body = document.querySelector('body') ?? { dispatchEvent: null };
    const originalBodyDispatchEvent = body.dispatchEvent;

    body.dispatchEvent = jest.fn();
    simulateKey(ArrowKey.ARROW_LEFT_KEY);
    expect(body.dispatchEvent).toHaveBeenCalledWith(leftKeyEvent);
    simulateKey(ArrowKey.ARROW_RIGHT_KEY);
    expect(body.dispatchEvent).toHaveBeenCalledWith(rightKeyEvent);
    body.dispatchEvent = originalBodyDispatchEvent;
  });
  it('should console error when there is no body', () => {
    document.querySelector('body')?.remove();
    const originalConsoleError = console.error;
    console.error = jest.fn();
    simulateKey('test' as ArrowKey);
    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toHaveBeenLastCalledWith(
      `simulateKey failed, couldn't find body`
    );
    console.error = originalConsoleError;
  });
});

describe('updateVideoTime', () => {
  const videoElement = document.createElement('video');
  it('should reduce to the currentTime video when ARROW_LEFT_KEY', () => {
    videoElement.currentTime = 100;
    updateVideoTime({
      seconds: 30,
      video: videoElement,
      updateType: ArrowKey.ARROW_LEFT_KEY,
    });
    expect(videoElement.currentTime).toBe(70);
  });
  it('should add to the currentTime video when ARROW_RIGHT_KEY', () => {
    videoElement.currentTime = 100;
    updateVideoTime({
      seconds: 30,
      video: videoElement,
      updateType: ArrowKey.ARROW_RIGHT_KEY,
    });
    expect(videoElement.currentTime).toBe(130);
  });
  it('should do nothing to the currentTime video when no arrow', () => {
    videoElement.currentTime = 100;
    updateVideoTime({
      seconds: 30,
      video: videoElement,
      updateType: 'test_key' as any,
    });
    expect(videoElement.currentTime).toBe(100);
  });
});

describe('handleArrowButtons', () => {
  const videoElement = document.createElement('video');
  let simulateKeySpy: jest.SpyInstance<void, [key: ArrowKey]> = jest.spyOn(
    other,
    'simulateKey'
  );
  let updateVideoTimeSpy = jest.spyOn(other, 'updateVideoTime');

  beforeAll(async () => {
    simulateKeySpy.mockClear();
    updateVideoTimeSpy.mockClear();
    simulateKeySpy = jest.spyOn(other, 'simulateKey');
    updateVideoTimeSpy = jest.spyOn(other, 'updateVideoTime');
  });

  afterEach(() => {
    simulateKeySpy.mockReset();
  });

  it('should call simulateKey when the seconds === 5', () => {
    handleArrowButtons({
      seconds: 5,
      updateType: ArrowKey.ARROW_LEFT_KEY,
      video: videoElement,
    });
    expect(simulateKeySpy).toHaveBeenCalledTimes(1);
    expect(updateVideoTimeSpy).not.toHaveBeenCalled();
  });
  it('should call updateVideoTime when the seconds !==  5', () => {
    handleArrowButtons({
      seconds: 10,
      updateType: ArrowKey.ARROW_LEFT_KEY,
      video: videoElement,
    });
    expect(updateVideoTimeSpy).toHaveBeenCalledTimes(1);
    expect(simulateKeySpy).not.toHaveBeenCalled();
  });
});

describe('overrideArrowKeys', () => {
  const videoElement = document.createElement('video');
  const key = ArrowKey.ARROW_LEFT_KEY;
  const event: KeyboardEvent = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: KEY_CODES[key],
    which: KEY_CODES[key],
  });
  let updateVideoTimeSpy = jest.spyOn(other, 'updateVideoTime');

  beforeEach(async () => {
    updateVideoTimeSpy.mockClear();
    event.preventDefault = jest.fn();
    updateVideoTimeSpy = jest.spyOn(other, 'updateVideoTime');
  });

  afterEach(() => {
    updateVideoTimeSpy.mockReset();
  });

  it('Should not skip override and run updateVideoTime', () => {
    overrideArrowKeys(
      event,
      { ...DEFAULT_OPTIONS, shouldOverrideKeys: true, rewindSeconds: 10 },
      videoElement
    );
    expect(event.preventDefault).toHaveBeenCalled();
    expect(updateVideoTimeSpy).toHaveBeenCalledWith({
      seconds: 10,
      video: videoElement,
      updateType: key,
    });
  });
  it('Should skip override and not run updateVideoTime when options.shouldOverrideKeys is false', () => {
    overrideArrowKeys(
      event,
      { ...DEFAULT_OPTIONS, shouldOverrideKeys: false, rewindSeconds: 10 },
      videoElement
    );
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(updateVideoTimeSpy).not.toHaveBeenCalled();
  });
  it('Should skip override and not run updateVideoTime when options.shouldOverrideKeys is true but the seconds are 5', () => {
    overrideArrowKeys(
      event,
      { ...DEFAULT_OPTIONS, shouldOverrideKeys: true, rewindSeconds: 5 },
      videoElement
    );
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(updateVideoTimeSpy).not.toHaveBeenCalled();
  });
});

describe('handleTooltipOnMouseOver', () => {
  const errorMessage = `Couldn't find player container`;
  const originalConsoleError = console.error;
  const button = document.createElement('button') as HTMLButtonElement;

  beforeEach(async () => {
    console.error = jest.fn();
    document.body.innerHTML = HTML_PLAYER_FULL;
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('Should console error when there is not player', () => {
    document.body.innerHTML = /* html */ `
      <p>TEST</P>
    `;
    handleTooltipOnMouseOver.bind(button)();
    expect(console.error).toHaveBeenCalled();
    document.body.innerHTML = /* html */ `
      <p>TEST</P>
      <div class="ytp-tooltip-text-wrapper">
        <span class="ytp-tooltip-text"></span>
      </div>
    `;
    handleTooltipOnMouseOver.bind(button)();
    expect(console.error).toHaveBeenCalledWith(errorMessage);
  });

  it('Should change the tooltip continuer with the correct classes', () => {
    handleTooltipOnMouseOver.bind(button)();
    const tooltipContainer = document.querySelector(
      TOOLTIP_CONTAINER_WRAPPER_QUERY
    )?.parentElement as HTMLDivElement;
    const classList = tooltipContainer.classList;
    expect(classList.contains('ytp-tooltip')).toBe(true);
    expect(classList.contains('ytp-bottom')).toBe(true);
    expect(classList.contains('ytp-preview')).toBe(false);
    expect(classList.contains('ytp-has-duration')).toBe(false);
  });

  it('Should change the tooltip continuer with the correct styles', () => {
    handleTooltipOnMouseOver.bind(button)();
    const tooltipContainer = document.querySelector(
      TOOLTIP_CONTAINER_WRAPPER_QUERY
    )?.parentElement as HTMLDivElement;

    const style = tooltipContainer.style;
    expect(style.maxWidth).toBe('300px');
    expect(style.display).toBe('block');
  });
});

describe('handleTooltipOnMouseLeave', () => {
  const originalConsoleError = console.error;
  const textTest = 'text test';
  const button = document.createElement('button') as HTMLButtonElement;

  beforeEach(async () => {
    console.error = jest.fn();
    document.body.innerHTML = HTML_PLAYER_FULL;
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('Should throw an error when there is no tooltip', () => {
    document.body.innerHTML = /* html */ `
    <p>TEST</P>
  `;
    handleTooltipOnMouseLeave.bind(button)();
    expect(console.error).toHaveBeenCalled();
  });

  it('Should update the style and the classes', () => {
    const tooltipContainer = document.querySelector(
      TOOLTIP_CONTAINER_WRAPPER_QUERY
    )?.parentElement as HTMLDivElement;
    (
      tooltipContainer.querySelector('span.ytp-tooltip-text') as HTMLSpanElement
    ).innerText = textTest;
    handleTooltipOnMouseLeave.bind(button)();
    expect(tooltipContainer.style.display).toBe('none');
    expect(tooltipContainer.getAttribute('aria-hidden')).toBe('true');
    expect(tooltipContainer.classList.contains('ytp-bottom')).toBe(false);
    expect(button.title).toBe(textTest);
  });
});

describe('loadOptions', () => {
  const originalConsoleError = console.error;

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('Should return the values from the storage if exists', async () => {
    const options = {
      rewindSeconds: 10,
      forwardSeconds: 2,
      shouldOverrideKeys: true,
    };
    chrome.storage.sync.get.mockReturnValue(options as any);
    const loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject(options);
  });

  it(`Should return the default value from if the on storage doesn't exists`, async () => {
    const options = {
      rewindSeconds: 10,
      shouldOverrideKeys: true,
    };
    chrome.storage.sync.get.mockReturnValue({ ...options } as any);
    let loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject({
      ...options,
      forwardSeconds: DEFAULT_OPTIONS.forwardSeconds,
    });

    chrome.storage.sync.get.mockReturnValue({
      ...options,
      rewindSeconds: '|',
    } as any);
    loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject({
      ...options,
      forwardSeconds: DEFAULT_OPTIONS.forwardSeconds,
      rewindSeconds: DEFAULT_OPTIONS.rewindSeconds,
    });

    const options2 = {
      rewindSeconds: 10,
    };
    chrome.storage.sync.get.mockReturnValue(options2 as any);
    loadedOptions = await loadOptions();

    expect(loadedOptions).toMatchObject({
      ...options2,
      forwardSeconds: DEFAULT_OPTIONS.forwardSeconds,
      shouldOverrideKeys: DEFAULT_OPTIONS.shouldOverrideKeys,
    });
  });

  it('Should catch the error and return the default values', async () => {
    const errorMessage = 'something happened!';
    console.error = jest.fn();
    chrome.storage.sync.get.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    const loadedOptions = await loadOptions();
    expect(console.error).toHaveBeenCalledWith(new Error(errorMessage));
    expect(loadedOptions).toMatchObject(DEFAULT_OPTIONS);
  });
});
