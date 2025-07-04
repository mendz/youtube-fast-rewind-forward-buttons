import { chrome } from 'jest-chrome';
import { describe } from 'node:test';
import { IStorageOptions } from '../../content/types';
import {
  DEFAULT_OPTIONS_MOCK,
  DEFAULT_STORAGE_OPTIONS_MOCK,
  INPUTS_IDS,
  InputId,
  MOCK_HTML,
} from '../__utils__/tests-helper';
import {
  getInputs,
  handleOverrideKeysMigration,
  loadInputStorageOptions,
  resetToDefaultOptions,
  saveOptions,
  submit,
} from '../options-page';

describe('Options page', () => {
  beforeEach(() => {
    document.body.innerHTML = MOCK_HTML;
  });

  describe('getInputs', () => {
    it('Should return all 5 inputs', () => {
      const inputs = getInputs();
      expect(Object.keys(inputs).length).toBe(5);
    });

    it('Should return the same amounts of inputs in the page', () => {
      const pageInputs = document.querySelectorAll<HTMLInputElement>('input');
      const inputs = getInputs();
      const flattenedInputs = [
        inputs.inputRewindSeconds,
        inputs.inputForwardSeconds,
        inputs.secondarySeconds.checkboxIsEnabled,
        inputs.secondarySeconds.inputRewindSeconds,
        inputs.secondarySeconds.inputForwardSeconds,
        inputs.inputShouldOverrideArrowKeys,
        inputs.inputShouldOverrideMediaKeys,
      ];
      expect(Array.from(pageInputs)).toStrictEqual(
        Object.values(flattenedInputs)
      );
    });

    it('Should return inputs that match all the ids', () => {
      const inputs = getInputs();
      const flattenedInputs = [
        inputs.inputRewindSeconds,
        inputs.inputForwardSeconds,
        inputs.inputShouldOverrideArrowKeys,
        inputs.inputShouldOverrideMediaKeys,
        inputs.secondarySeconds.checkboxIsEnabled,
        inputs.secondarySeconds.inputRewindSeconds,
        inputs.secondarySeconds.inputForwardSeconds,
      ];
      const matchIds = flattenedInputs.every((input) =>
        INPUTS_IDS.includes(input.id as InputId)
      );
      expect(matchIds).toBe(true);
    });
  });

  describe('saveOptions', () => {
    const originalConsoleError = console.error;
    const originalConsoleInfo = console.info;
    const originalWindowClose = window.close;

    beforeEach(() => {
      document.body.innerHTML = MOCK_HTML;
      console.info = jest.fn();
      console.error = jest.fn();
      window.close = jest.fn();
    });

    afterEach(() => {
      console.error = originalConsoleError;
      console.info = originalConsoleInfo;
      window.close = originalWindowClose;
    });

    it('Should console info when saved', async () => {
      await saveOptions();
      expect(console.info).toHaveBeenCalledWith('options saved!');
    });

    it('Should close the window after saving', async () => {
      await saveOptions();
      expect(window.close).toHaveBeenCalled();
    });

    it('Should console.error when set function throw an error', () => {
      chrome.storage.sync.set.mockImplementation(() => {
        throw 'ERROR!';
      });
      saveOptions();
      expect(console.info).not.toHaveBeenCalled();
      expect(window.close).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('ERROR!');
    });

    it('Should save what returns from the getInputs', () => {
      document.body.innerHTML = MOCK_HTML;
      const pageInputs = Array.from(
        document.querySelectorAll<HTMLInputElement>('input')
      );
      const rewindInput = pageInputs.find(
        (input) => input.id === InputId.REWIND
      ) as HTMLInputElement;
      rewindInput.value = '10';
      const overrideMediaKeysInput = pageInputs.find(
        (input) => input.id === InputId.OVERRIDE_MEDIA_KEYS
      ) as HTMLInputElement;
      overrideMediaKeysInput.checked = true;

      saveOptions();
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        rewindSeconds: '10',
        forwardSeconds: '5',
        shouldOverrideArrowKeys: false,
        shouldOverrideMediaKeys: true,
        secondarySeconds: {
          checkboxIsEnabled: false,
          forwardSeconds: '5',
          rewindSeconds: '5',
        },
      });
    });
  });

  describe('handleOverrideKeysMigration', () => {
    it('Should use the saved old value', () => {
      const mockInput = { checked: false } as HTMLInputElement;
      const storageOptions: IStorageOptions = {
        ...DEFAULT_STORAGE_OPTIONS_MOCK,
        shouldOverrideKeys: true,
      };
      handleOverrideKeysMigration(mockInput, storageOptions);

      expect(mockInput.checked).toBe(true);
    });

    it('Should use the saved new value', () => {
      const mockInput = { checked: false } as HTMLInputElement;
      const storageOptions: IStorageOptions = {
        ...DEFAULT_STORAGE_OPTIONS_MOCK,
        shouldOverrideKeys: false,
        shouldOverrideArrowKeys: true,
      };
      handleOverrideKeysMigration(mockInput, storageOptions);

      expect(mockInput.checked).toBe(true);

      storageOptions.shouldOverrideArrowKeys = false;
      handleOverrideKeysMigration(mockInput, storageOptions);

      expect(mockInput.checked).toBe(false);

      delete storageOptions.shouldOverrideKeys;
      storageOptions.shouldOverrideArrowKeys = true;
      handleOverrideKeysMigration(mockInput, storageOptions);

      expect(mockInput.checked).toBe(true);
    });
  });

  describe('loadInputStorageOptions', () => {
    it('should load the inputs with the data stored in the storage', async () => {
      document.body.innerHTML = MOCK_HTML;
      chrome.storage.sync.get.mockReturnValue({
        ...DEFAULT_OPTIONS_MOCK,
        forwardSeconds: 20,
        shouldOverrideArrowKeys: true,
      } as any);

      await loadInputStorageOptions();

      const pageInputs = Array.from(
        document.querySelectorAll<HTMLInputElement>('input')
      );
      const forwardInput = pageInputs.find(
        (input) => input.id === InputId.FORWARD
      ) as HTMLInputElement;
      const rewindInput = pageInputs.find(
        (input) => input.id === InputId.REWIND
      ) as HTMLInputElement;
      const overrideArrowKeysInput = pageInputs.find(
        (input) => input.id === InputId.OVERRIDE_ARROW_KEYS
      ) as HTMLInputElement;
      const overrideMediaKeysInput = pageInputs.find(
        (input) => input.id === InputId.OVERRIDE_MEDIA_KEYS
      ) as HTMLInputElement;

      expect(forwardInput.value).toBe('20');
      expect(rewindInput.value).toBe('5');
      expect(overrideArrowKeysInput.checked).toBe(true);
      expect(overrideMediaKeysInput.checked).toBe(false);
    });
  });

  describe('resetToDefaultOptions', () => {
    beforeEach(() => {
      document.body.innerHTML = MOCK_HTML;
      window.confirm = jest.fn();
    });

    it('should confirm', async () => {
      await resetToDefaultOptions();
      expect(window.confirm).toHaveBeenCalledWith('Are you sure?');
    });

    it('should if user decline confirm, should not run sync.set', async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);
      await resetToDefaultOptions();
      expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    });

    it('should if user approve confirm, should run sync.set', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      await resetToDefaultOptions();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const defaultOpinions = { ...DEFAULT_OPTIONS_MOCK };
      defaultOpinions.shouldOverrideKeys = false;
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(defaultOpinions);
    });

    it('should reset DOM with the default values', async () => {
      // setup
      setInputValue(InputId.FORWARD, '10');
      setInputValue(InputId.OVERRIDE_ARROW_KEYS, true);
      setInputValue(InputId.ENABLE_MORE_BUTTONS, true);
      setInputValue(InputId.REWIND_SECONDARY, '15');
      setInputValue(InputId.FORWARD_SECONDARY, '20');

      // verify setup values
      expect(getInputValue(InputId.FORWARD)).toBe('10');
      expect(getInputValue(InputId.OVERRIDE_ARROW_KEYS)).toBe(true);
      expect(getInputValue(InputId.ENABLE_MORE_BUTTONS)).toBe(true);
      expect(getInputValue(InputId.REWIND_SECONDARY)).toBe('15');
      expect(getInputValue(InputId.FORWARD_SECONDARY)).toBe('20');

      (window.confirm as jest.Mock).mockReturnValue(true);

      // run
      await resetToDefaultOptions();

      // test default values
      expect(getInputValue(InputId.FORWARD)).toBe('5');
      expect(getInputValue(InputId.OVERRIDE_ARROW_KEYS)).toBe(false);
      expect(getInputValue(InputId.ENABLE_MORE_BUTTONS)).toBe(false);
      expect(getInputValue(InputId.REWIND_SECONDARY)).toBe('5');
      expect(getInputValue(InputId.FORWARD_SECONDARY)).toBe('5');
    });
  });

  describe('submit', () => {
    document.body.innerHTML = MOCK_HTML;
    const event = { preventDefault: jest.fn() } as unknown as Event;

    it('should event run preventDefault', () => {
      submit(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });
});

function setInputValue(id: InputId, value: string | boolean): void {
  const input = document.querySelector<HTMLInputElement>(`#${id}`);
  if (typeof value === 'boolean') {
    input!.checked = value;
  } else {
    input!.value = value;
  }
}

function getInputValue(id: InputId): string | boolean {
  const input = document.querySelector<HTMLInputElement>(`#${id}`);
  return input!.type === 'checkbox' ? input!.checked : input!.value;
}
