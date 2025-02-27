import {
  createSvgMock,
  DEFAULT_OPTIONS_MOCK,
  removeSpaces,
  SVG_CLASSES_MOCK,
  SVG_FORWARD_USE_HTML_MOCK,
  SVG_PATH_CLASSES_MOCK,
  X_LINK_ATTR,
} from '../__utils__/tests-helper';
import {
  createButton,
  createFastForwardSVG,
  createFastRewindSVG,
  createForwardButtonTitle,
  createRewindButtonTitle,
  getSeconds,
  numberFormat,
} from '../helper';
import { ArrowKey, ButtonClassesIds } from '../types';

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

describe('getSeconds', () => {
  it('should return 5 when wrong key', () => {
    const resultWrongUpdateType: number = getSeconds(
      'test',
      DEFAULT_OPTIONS_MOCK
    );
    expect(resultWrongUpdateType).toBe(5);
  });
  it('should return 10 for left key', () => {
    const newOptions = {
      ...DEFAULT_OPTIONS_MOCK,
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
      ...DEFAULT_OPTIONS_MOCK,
      forwardSeconds: 20,
    };
    const resultRightKey: number = getSeconds(
      ArrowKey.ARROW_RIGHT_KEY,
      newOptions
    );
    expect(resultRightKey).toBe(20);
  });
});

describe('createFastRewindSVG', () => {
  const rewindSvg = `
      <svg class="" height="100%" width="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path class="" id="custom-path-rewind" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
      </svg>`;
  const xLinkAttrCustomId = '#custom-path-rewind';

  it('should return the correct svg', () => {
    const newSvg: string = createFastRewindSVG([], '', []);
    expect(removeSpaces(newSvg)).toBe(removeSpaces(rewindSvg));
  });
  it('should populate with svgClasses', () => {
    const svgElement = createSvgMock(
      SVG_CLASSES_MOCK,
      '',
      [],
      'getFastRewindSVG'
    );

    expect(svgElement?.classList.contains(SVG_CLASSES_MOCK[0])).toBeTruthy();
    expect(svgElement?.querySelector('path')?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('use')).toBeFalsy();
  });
  it('should populate with svgPathClasses', () => {
    const svgElement = createSvgMock(
      [],
      '',
      SVG_PATH_CLASSES_MOCK,
      'getFastRewindSVG'
    );

    expect(svgElement?.classList.length).toBeFalsy();
    expect(
      svgElement
        ?.querySelector('path')
        ?.classList.contains(SVG_PATH_CLASSES_MOCK[0])
    ).toBeTruthy();
    expect(svgElement?.querySelector('use')).toBeFalsy();
  });
  it('should populate with svgUseHtml', () => {
    const svgElement = createSvgMock(
      [],
      SVG_FORWARD_USE_HTML_MOCK,
      [],
      'getFastRewindSVG'
    );

    expect(svgElement?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('path')?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('use')).toBeTruthy();
    expect(svgElement?.querySelector('use')?.getAttribute(X_LINK_ATTR)).toBe(
      xLinkAttrCustomId
    );
  });
  it('should populate with all values', () => {
    const svgElement = createSvgMock(
      SVG_CLASSES_MOCK,
      SVG_FORWARD_USE_HTML_MOCK,
      SVG_PATH_CLASSES_MOCK,
      'getFastRewindSVG'
    );

    expect(svgElement?.classList.contains(SVG_CLASSES_MOCK[0])).toBeTruthy();
    expect(
      svgElement
        ?.querySelector('path')
        ?.classList.contains(SVG_PATH_CLASSES_MOCK[0])
    ).toBeTruthy();
    expect(svgElement?.querySelector('use')).toBeTruthy();
    expect(svgElement?.querySelector('use')?.getAttribute(X_LINK_ATTR)).toBe(
      xLinkAttrCustomId
    );
  });
});

describe('createFastForwardSVG', () => {
  const forwardSvg = `
      <svg class="" height="100%" width="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path class="" id="custom-path-fast-forward" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
      </svg>`;
  const xLinkAttrCustomId = '#custom-path-fast-forward';

  it('should return the correct svg', () => {
    const newSvg: string = createFastForwardSVG([], '', []);
    expect(removeSpaces(newSvg)).toBe(removeSpaces(forwardSvg));
  });
  it('should populate with svgClasses', () => {
    const svgElement = createSvgMock(
      SVG_CLASSES_MOCK,
      '',
      [],
      'getFastForwardSVG'
    );

    expect(svgElement?.classList.contains(SVG_CLASSES_MOCK[0])).toBeTruthy();
    expect(svgElement?.querySelector('path')?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('use')).toBeFalsy();
  });
  it('should populate with svgPathClasses', () => {
    const svgElement = createSvgMock(
      [],
      '',
      SVG_PATH_CLASSES_MOCK,
      'getFastForwardSVG'
    );

    expect(svgElement?.classList.length).toBeFalsy();
    expect(
      svgElement
        ?.querySelector('path')
        ?.classList.contains(SVG_PATH_CLASSES_MOCK[0])
    ).toBeTruthy();
    expect(svgElement?.querySelector('use')).toBeFalsy();
  });
  it('should populate with svgUseHtml', () => {
    const svgElement = createSvgMock(
      [],
      SVG_FORWARD_USE_HTML_MOCK,
      [],
      'getFastForwardSVG'
    );

    expect(svgElement?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('path')?.classList.length).toBeFalsy();
    expect(svgElement?.querySelector('use')).toBeTruthy();
    expect(svgElement?.querySelector('use')?.getAttribute(X_LINK_ATTR)).toBe(
      xLinkAttrCustomId
    );
  });
  it('should populate with all values', () => {
    const svgElement = createSvgMock(
      SVG_CLASSES_MOCK,
      SVG_FORWARD_USE_HTML_MOCK,
      SVG_PATH_CLASSES_MOCK,
      'getFastForwardSVG'
    );

    expect(svgElement?.classList.contains(SVG_CLASSES_MOCK[0])).toBeTruthy();
    expect(
      svgElement
        ?.querySelector('path')
        ?.classList.contains(SVG_PATH_CLASSES_MOCK[0])
    ).toBeTruthy();
    expect(svgElement?.querySelector('use')).toBeTruthy();
    expect(svgElement?.querySelector('use')?.getAttribute(X_LINK_ATTR)).toBe(
      xLinkAttrCustomId
    );
  });
});

describe('createRewindButtonTitle return the correct text', () => {
  const fullTextFiveSeconds = 'Go back 5 seconds (left arrow)';
  const fullTextTenSeconds = 'Go back 10 seconds (left arrow)';
  const shortTextTenSeconds = 'Go back 10 seconds';

  it('should return with 5 seconds without overrideArrowKeys', () => {
    const result: string = createRewindButtonTitle(5, false);
    expect(result).toBe(fullTextFiveSeconds);
  });
  it('should return with 5 seconds & with overrideArrowKeys', () => {
    const result: string = createRewindButtonTitle(5, true);
    expect(result).toBe(fullTextFiveSeconds);
  });
  it('should return with 10 seconds & with overrideArrowKeys', () => {
    const result: string = createRewindButtonTitle(10, true);
    expect(result).toBe(fullTextTenSeconds);
  });
  it('should return with 10 seconds & without overrideArrowKeys', () => {
    const result: string = createRewindButtonTitle(10, false);
    expect(result).toBe(shortTextTenSeconds);
  });
});

describe('createForwardButtonTitle return the correct text', () => {
  const fullTextFiveSeconds = 'Go forward 5 seconds (right arrow)';
  const fullTextTenSeconds = 'Go forward 10 seconds (right arrow)';
  const shortTextTenSeconds = 'Go forward 10 seconds';

  it('should return with 5 seconds without overrideArrowKeys', () => {
    const result: string = createForwardButtonTitle(5, false);
    expect(result).toBe(fullTextFiveSeconds);
  });
  it('should return with 5 seconds & with overrideArrowKeys', () => {
    const result: string = createForwardButtonTitle(5, true);
    expect(result).toBe(fullTextFiveSeconds);
  });
  it('should return with 10 seconds & with overrideArrowKeys', () => {
    const result: string = createForwardButtonTitle(10, true);
    expect(result).toBe(fullTextTenSeconds);
  });
  it('should return with 10 seconds & without overrideArrowKeys', () => {
    const result: string = createForwardButtonTitle(10, false);
    expect(result).toBe(shortTextTenSeconds);
  });
});

describe('numberFormat', () => {
  it('should format seconds correctly', () => {
    expect(numberFormat(5)).toBe('5 seconds');
    expect(numberFormat(59)).toBe('59 seconds');
    expect(numberFormat(59.9999)).toBe('59 seconds');
  });

  it('should format minutes correctly', () => {
    expect(numberFormat(60)).toBe('1 minute');
    expect(numberFormat(120)).toBe('2 minutes');
    expect(numberFormat(3599)).toBe('59m 59s');
  });

  it('should format hours correctly', () => {
    expect(numberFormat(3600)).toBe('1 hour');
    expect(numberFormat(7200)).toBe('2 hours');
    expect(numberFormat(10800)).toBe('3 hours');
  });

  it('should format mixed units correctly', () => {
    expect(numberFormat(3661)).toBe('1h 1m 1s');
    expect(numberFormat(7322)).toBe('2h 2m 2s');
    expect(numberFormat(3605)).toBe('1h 5s');
  });
});
