import { ArrowKey, ButtonClassesIds, CreateButtonArg, IOptions } from './types';

export function createButton({
  svg,
  title,
  id,
}: CreateButtonArg): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.classList.add('ytp-button');
  button.classList.add(ButtonClassesIds.CLASS);
  button.innerHTML = svg;
  button.title = title;
  button.setAttribute('aria-label', title);
  if (id) {
    button.id = id;
  }
  return button;
}

export function getSeconds(updateType: string, options: IOptions): number {
  switch (updateType) {
    case ArrowKey.ARROW_LEFT_KEY:
      return options.rewindSeconds;
    case ArrowKey.ARROW_RIGHT_KEY:
      return options.forwardSeconds;
    default:
      return 5;
  }
}

export function createFastRewindSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
    <svg class="${svgClasses}" height="100%" width="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      ${svgUseHtml.replace(
        /xlink:href="#.*"/,
        'xlink:href="#custom-path-rewind"'
      )}
      <path class="${svgPathClasses}" id="custom-path-rewind" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
    </svg>
  `;
}

export function createFastForwardSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
    <svg class="${svgClasses}" height="100%" width="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    ${svgUseHtml.replace(
      /xlink:href="#.*"/,
      'xlink:href="#custom-path-fast-forward"'
    )}
      <path class="${svgPathClasses}" id="custom-path-fast-forward" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
    </svg>
  `;
}

export function createRewindButtonTitle(
  seconds: number,
  shouldOverrideArrowKeys: boolean
): string {
  const title: string =
    shouldOverrideArrowKeys || seconds === 5 ? ' (left arrow)' : '';
  return `Go back ${numberFormat(seconds)}${title}`;
}

export function createForwardButtonTitle(
  seconds: number,
  shouldOverrideArrowKeys: boolean
): string {
  const title: string =
    shouldOverrideArrowKeys || seconds === 5 ? ' (right arrow)' : '';
  return `Go forward ${numberFormat(seconds)}${title}`;
}

export function numberFormat(value: number): string {
  const units: Intl.NumberFormatOptions['unit'][] = [
    'second',
    'minute',
    'hour',
  ];
  let amount = value;
  let unitIndex = 0;

  // Iteratively convert the value by dividing by 60 while it exceeds 60
  while (Math.round(amount * 2) / 2 >= 60 && unitIndex < units.length - 1) {
    amount /= 60;
    unitIndex++;
  }

  const rounded = Math.round(amount * 2) / 2;
  const options: Intl.NumberFormatOptions = {
    style: 'unit',
    unit: units[unitIndex],
    unitDisplay: 'long',
    maximumFractionDigits: 2,
  };

  return new Intl.NumberFormat('en-US', options).format(Math.max(1, rounded));
}
