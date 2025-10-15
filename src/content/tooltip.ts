export function getElementsForTooltipCalculation(): {
  tooltipContainer: HTMLElement;
  tooltipTextSpan: HTMLSpanElement;
} {
  const textWrapper: Nullable<Element> = document.querySelector(
    'div.ytp-tooltip-text-wrapper'
  );

  if (!textWrapper) {
    throw new Error(`Couldn't find tooltip elements!`);
  }

  const tooltipContainer: Nullable<HTMLElement> = textWrapper.parentElement;
  const tooltipTextSpan: Nullable<HTMLSpanElement> = textWrapper.querySelector(
    'span.ytp-tooltip-text'
  );

  if (!tooltipContainer || !tooltipTextSpan) {
    throw new Error(`Couldn't find tooltip elements!`);
  }

  return {
    tooltipContainer,
    tooltipTextSpan,
  };
}

/**
 * Handle mouse over button events for showing the tooltip
 */
export function handleTooltipOnMouseOver(this: HTMLButtonElement): void {
  try {
    const { tooltipContainer, tooltipTextSpan: textSpan } =
      getElementsForTooltipCalculation();

    // elements height for calculate the top of the button
    const mainPlayerContainer: Nullable<Element> =
      document.querySelector('ytd-player');

    if (!mainPlayerContainer) {
      console.error(`Couldn't find player container`);
      return;
    }

    // const playerContainerHeight: number = mainPlayerContainer.clientHeight;
    // const bottomControlsHeight: number =
    //   document.querySelector('div.ytp-chrome-bottom')?.clientHeight ?? 0;
    // const buttonHeight: number = this.clientHeight;
    // const tooltipTopPosition: number =
    //   playerContainerHeight - bottomControlsHeight - buttonHeight + 12;

    // change values to show  the tooltip
    tooltipContainer.classList.add('ytp-tooltip');
    tooltipContainer.classList.add('ytp-bottom');
    tooltipContainer.classList.remove('ytp-preview');
    tooltipContainer.classList.remove('ytp-text-detail');
    tooltipContainer.classList.remove('ytp-has-duration');
    tooltipContainer.style.maxWidth = '300px';
    // tooltipContainer.style.top = `${tooltipTopPosition}px`;
    tooltipContainer.style.left = `${this.offsetLeft - this.offsetWidth}px`;
    tooltipContainer.style.display = 'block';
    tooltipContainer.setAttribute('aria-hidden', 'false');
    textSpan.innerHTML = this.title;

    // remove title from the button
    this.title = '';
  } catch (error) {
    console.error(error);
  }
}

/**
 * Handle mouse leave button events for showing the tooltip
 */
export function handleTooltipOnMouseLeave(this: HTMLButtonElement): void {
  try {
    const { tooltipContainer, tooltipTextSpan: textSpan } =
      getElementsForTooltipCalculation();

    const title: string = textSpan.innerText;

    // change values to hide the tooltip
    tooltipContainer.style.display = 'none';
    tooltipContainer.setAttribute('aria-hidden', 'true');
    tooltipContainer.classList.remove('ytp-bottom');
    this.title = title;
  } catch (error) {
    console.error(error);
  }
}
