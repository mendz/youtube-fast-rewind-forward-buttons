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
    <svg class="${svgClasses.join(' ')}" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%" fill="#e3e3e3">
       ${svgUseHtml.replace(
         /xlink:href="#.*"/,
         'xlink:href="#custom-path-rewind"'
       )}
      <path id="custom-path-rewind" class="${svgPathClasses.join(' ')}" d="M856-240 505.33-480 856-720v480Zm-401.33 0L104-480l350.67-240v480Z" />
    </svg>
  `;
}

export function createFastForwardSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
    <svg class="${svgClasses.join(' ')}" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%" fill="#e3e3e3">
      ${svgUseHtml.replace(
        /xlink:href="#.*"/,
        'xlink:href="#custom-path-fast-forward"'
      )}
      <path id="custom-path-fast-forward" class="${svgPathClasses.join(' ')}" d="M102.67-240v-480l350.66 240-350.66 240Zm404.66 0v-480L858-480 507.33-240Z" />
    </svg>
  `;
}

export function createFastDoubleRewindSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
  <svg class="${svgClasses.join(' ')}" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%" fill="#e3e3e3">
      ${svgUseHtml.replace(
        /xlink:href="#.*"/,
        'xlink:href="#custom-path-double-rewind"'
      )}
    <path id="custom-path-double-rewind" class="${svgPathClasses.join(' ')}" d="m448.67-240.67-240-240 240-240L495.33-674l-193 193.33 193 193.34-46.66 46.66Zm256.66 0-240-240 240-240L752-674 559-480.67l193 193.34-46.67 46.66Z"/>
  </svg>
  `;
}

export function createFastDoubleForwardSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
  <svg class="${svgClasses.join(' ')}" xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%" fill="#e3e3e3">
   ${svgUseHtml.replace(
     /xlink:href="#.*"/,
     'xlink:href="#custom-path-double-forward"'
   )}
    <path id="custom-path-double-forward" class="${svgPathClasses.join(' ')}" d="M401.67-480.67 208.67-674l46.66-46.67 240 240-240 240-46.66-46.66 193-193.34Zm256.66 0L465.33-674 512-720.67l240 240-240 240-46.67-46.66 193-193.34Z"/>
  </svg>
  `;
}

export function createTitle(
  seconds: number,
  direction: 'back' | 'forward',
  suffix = ''
): string {
  return `Go ${direction} ${numberFormat(seconds)}${suffix}`;
}

export function createRewindButtonTitle(
  seconds: number,
  shouldOverrideArrowKeys: boolean
): string {
  const title: string =
    shouldOverrideArrowKeys || seconds === 5 ? ' (left arrow)' : '';
  return createTitle(seconds, 'back', title);
}

export function createForwardButtonTitle(
  seconds: number,
  shouldOverrideArrowKeys: boolean
): string {
  const title: string =
    shouldOverrideArrowKeys || seconds === 5 ? ' (right arrow)' : '';
  return createTitle(seconds, 'forward', title);
}

export function numberFormat(value: number): string {
  // Define unit values in seconds as well as corresponding full unit names and abbreviations.
  const unitValues = [1, 60, 3600]; // seconds, minutes, hours
  const unitNames: { [key: number]: Intl.NumberFormatOptions['unit'] } = {
    0: 'second',
    1: 'minute',
    2: 'hour',
  };
  const unitAbbr: { [key: number]: string } = {
    0: 's',
    1: 'm',
    2: 'h',
  };

  let remainingValue = value;
  const parts: { amount: number; index: number }[] = [];

  for (let i = unitValues.length - 1; i >= 0; i--) {
    const unitAmount = Math.floor(remainingValue / unitValues[i]);
    if (unitAmount > 0) {
      parts.push({ amount: unitAmount, index: i });
      remainingValue %= unitValues[i];
    }
  }

  // If no units were found, return "0 seconds".
  if (parts.length === 0) return '0 seconds';

  // For a single unit, use the full internationalized format.
  if (parts.length === 1) {
    const { amount, index } = parts[0];
    const options: Intl.NumberFormatOptions = {
      style: 'unit',
      unit: unitNames[index],
      unitDisplay: 'long',
      maximumFractionDigits: 0,
    };
    return new Intl.NumberFormat('en-US', options).format(amount);
  }

  // For multiple units, use the compact format "1h 12m 1s".
  // Note: parts are in descending order (hours -> minutes -> seconds).
  return parts.map((part) => `${part.amount}${unitAbbr[part.index]}`).join(' ');
}
