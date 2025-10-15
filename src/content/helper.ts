import { ArrowKey, ButtonClassesIds, CreateButtonArg, IOptions } from './types';

// Keep custom icons visually aligned with YouTube's native play button.
// The shapes are normalized to a 36x36 viewBox, then uniformly scaled down a touch.
const NORMALIZED_SVG_SCALE = 0.8;
const NORMALIZED_SVG_TRANSLATE = ((1 - NORMALIZED_SVG_SCALE) * 36) / 2;
const NORMALIZED_SVG_TRANSLATE_STR = NORMALIZED_SVG_TRANSLATE.toFixed(2);

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
  button.addEventListener('mouseenter', (e) => {
    (e.currentTarget as HTMLButtonElement).classList.toggle('active');
  });

  button.addEventListener('mouseleave', (e) => {
    (e.currentTarget as HTMLButtonElement).classList.toggle('active');
  });

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

/**
 * Build the normalized rewind SVG. We shrink/translate the path slightly so it
 * visually aligns with YouTube's native play button size.
 */
export function createFastRewindSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
    <svg class="${svgClasses.join(
      ' '
    )}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" height="36" width="36" fill="none">
      ${svgUseHtml.replace(
        /xlink:href="#.*"/,
        'xlink:href="#custom-path-rewind"'
      )}
      <path
        id="custom-path-rewind"
        class="${svgPathClasses.join(' ')}"
        d="M36 0L19.21 18L36 36V0ZM16.79 0L0 18L16.79 36V0Z"
        fill="white"
        transform="translate(${NORMALIZED_SVG_TRANSLATE_STR} ${NORMALIZED_SVG_TRANSLATE_STR}) scale(${NORMALIZED_SVG_SCALE})"
      />
    </svg>
  `;
}

/**
 * Build the normalized fast-forward SVG with the same scaling as the rewind icon.
 */
export function createFastForwardSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
    <svg class="${svgClasses.join(
      ' '
    )}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" height="36" width="36" fill="none">
      ${svgUseHtml.replace(
        /xlink:href="#.*"/,
        'xlink:href="#custom-path-fast-forward"'
      )}
      <path
        id="custom-path-fast-forward"
        class="${svgPathClasses.join(' ')}"
        d="M0 0V36L16.71 18L0 0ZM19.29 0V36L36 18L19.29 0Z"
        fill="white"
        transform="translate(${NORMALIZED_SVG_TRANSLATE_STR} ${NORMALIZED_SVG_TRANSLATE_STR}) scale(${NORMALIZED_SVG_SCALE})"
      />
    </svg>
  `;
}

/**
 * Build the double-rewind variant, applying the shared scaling factor for parity.
 */
export function createFastDoubleRewindSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
  <svg class="${svgClasses.join(
    ' '
  )}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" height="36" width="36" fill="none">
    ${svgUseHtml.replace(
      /xlink:href="#.*"/,
      'xlink:href="#custom-path-double-rewind"'
    )}
    <path
      id="custom-path-double-rewind"
      class="${svgPathClasses.join(' ')}"
      d="M15.9 0L0 18L15.9 36L18.99 32.5L6.21 18L18.99 3.5L15.9 0ZM32.91 0L17.01 18L32.91 36L36 32.5L23.21 18L36 3.5L32.91 0Z"
      fill="white"
      transform="translate(${NORMALIZED_SVG_TRANSLATE_STR} ${NORMALIZED_SVG_TRANSLATE_STR}) scale(${NORMALIZED_SVG_SCALE})"
    />
  </svg>
  `;
}

/**
 * Build the double-forward variant, applying the shared scaling factor for parity.
 */
export function createFastDoubleForwardSVG(
  svgClasses: string[],
  svgUseHtml: string,
  svgPathClasses: string[]
): string {
  return `
  <svg class="${svgClasses.join(
    ' '
  )}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" height="36" width="36" fill="none">
    ${svgUseHtml.replace(
      /xlink:href="#.*"/,
      'xlink:href="#custom-path-double-forward"'
    )}
    <path
      id="custom-path-double-forward"
      class="${svgPathClasses.join(' ')}"
      d="M12.79 18L0 32.5L3.09 36L18.99 18L3.09 0L0 3.5L12.79 18ZM29.79 18L17.01 32.5L20.1 36L36 18L20.1 0L17.01 3.5L29.79 18Z"
      fill="white"
      transform="translate(${NORMALIZED_SVG_TRANSLATE_STR} ${NORMALIZED_SVG_TRANSLATE_STR}) scale(${NORMALIZED_SVG_SCALE})"
    />
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
