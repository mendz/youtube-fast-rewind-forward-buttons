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
       <svg class="" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%" fill="#e3e3e3">
          <path id="custom-path-rewind" class="" d="M856-240 505.33-480 856-720v480Zm-401.33 0L104-480l350.67-240v480Z" />
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
      <svg class="" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%" fill="#e3e3e3">
      <path id="custom-path-fast-forward" class="" d="M102.67-240v-480l350.66 240-350.66 240Zm404.66 0v-480L858-480 507.33-240Z" />
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
  const fullTextMinuteSeconds = 'Go forward 1 minute (right arrow)';
  const shortTextMinuteSeconds = 'Go forward 1 minute';
  const fullTextComplexSeconds = 'Go forward 1h 8m 41s (right arrow)';
  const shortTextComplexSeconds = 'Go forward 1h 8m 41s';

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
  it('should return with 60 seconds & without overrideArrowKeys', () => {
    const result: string = createForwardButtonTitle(60, true);
    expect(result).toBe(fullTextMinuteSeconds);
  });
  it('should return with 60 seconds & without overrideArrowKeys', () => {
    const result: string = createForwardButtonTitle(60, false);
    expect(result).toBe(shortTextMinuteSeconds);
  });
  it('should return with 4121 seconds & without overrideArrowKeys', () => {
    const result: string = createForwardButtonTitle(4121, true);
    expect(result).toBe(fullTextComplexSeconds);
  });
  it('should return with 4121 seconds & without overrideArrowKeys', () => {
    const result: string = createForwardButtonTitle(4121, false);
    expect(result).toBe(shortTextComplexSeconds);
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
