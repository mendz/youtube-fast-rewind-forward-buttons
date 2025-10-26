jest.mock('../helper', () => {
  const actual = jest.requireActual('../helper');
  return {
    ...actual,
    isNewUiPlayer: jest.fn(() => false),
  };
});

import { isNewUiPlayer } from '../helper';
import {
  getElementsForTooltipCalculation,
  handleTooltipOnMouseLeave,
  handleTooltipOnMouseOver,
} from '../tooltip';
import {
  HTML_PLAYER_FULL,
  TOOLTIP_CONTAINER_WRAPPER_QUERY,
} from '../__utils__/tests-helper';

const mockIsNewUiPlayer = isNewUiPlayer as jest.MockedFunction<
  typeof isNewUiPlayer
>;

describe('getElementsForTooltipCalculation', () => {
  const wrapperQuery = TOOLTIP_CONTAINER_WRAPPER_QUERY;
  const wrapperParentQuery = 'div.ytp-tooltip';
  const tooltipContainerQuery = 'div.ytp-chrome-bottom';
  const spanTextQuery = 'span.ytp-tooltip-text';
  const error = `Couldn't find tooltip elements!`;

  it('should fail when no wrapper', () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    document.querySelector(wrapperQuery)?.remove();
    expect(getElementsForTooltipCalculation).toThrow(error);
  });

  it('should fail when no wrapper parent', () => {
    document.body.innerHTML = HTML_PLAYER_FULL;
    const wrapper = document.querySelector(wrapperQuery)?.cloneNode() as Node;
    document.querySelector(wrapperParentQuery)?.remove();
    document.querySelector(tooltipContainerQuery)?.appendChild(wrapper);
    expect(getElementsForTooltipCalculation).toThrow(error);
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
    expect(result).toEqual(tooltipElements);
  });
});

describe('handleTooltipOnMouseOver', () => {
  const errorMessage = `Couldn't find player container`;
  const originalConsoleError = console.error;
  const button = document.createElement('button') as HTMLButtonElement;

  beforeEach(async () => {
    console.error = jest.fn();
    document.body.innerHTML = HTML_PLAYER_FULL;
    mockIsNewUiPlayer.mockReturnValue(false);
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

  it('Should position the tooltip when using the legacy player', () => {
    const playerElement = document.querySelector('ytd-player') as HTMLElement;
    Object.defineProperty(playerElement, 'clientHeight', {
      value: 300,
      configurable: true,
    });

    const chromeBottom = document.querySelector(
      'div.ytp-chrome-bottom'
    ) as HTMLElement;
    Object.defineProperty(chromeBottom, 'clientHeight', {
      value: 50,
      configurable: true,
    });

    Object.defineProperty(button, 'clientHeight', {
      value: 20,
      configurable: true,
    });

    handleTooltipOnMouseOver.bind(button)();

    const tooltipContainer = document.querySelector(
      TOOLTIP_CONTAINER_WRAPPER_QUERY
    )?.parentElement as HTMLDivElement;

    expect(tooltipContainer.style.top).toBe('242px');
  });

  it('Should skip positioning when using the modern player', () => {
    const tooltipContainer = document.querySelector(
      TOOLTIP_CONTAINER_WRAPPER_QUERY
    )?.parentElement as HTMLDivElement;
    tooltipContainer.style.top = '123px';

    mockIsNewUiPlayer.mockReturnValue(true);
    handleTooltipOnMouseOver.bind(button)();

    expect(tooltipContainer.style.top).toBe('123px');
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
