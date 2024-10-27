/* eslint-disable sonarjs/no-duplicate-string */
import { chrome } from 'jest-chrome';
import { Runtime } from 'jest-chrome/types/jest-chrome';

describe('chrome.runtime.onInstalled listener', () => {
  let onInstalledListener: (details: Runtime.InstalledDetails) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    chrome.runtime.onInstalled.addListener = jest.fn(
      (callback: (details: Runtime.InstalledDetails) => void) => {
        onInstalledListener = callback;
      }
    );

    console.info = jest.fn();

    (chrome.runtime as any).OnInstalledReason = {
      UPDATE: 'update',
    };

    require('../service-worker');
  });

  it('should log versions and call showReadme when there is an update from version 1.3.0', () => {
    jest.spyOn(chrome.runtime, 'getManifest').mockReturnValue({
      version: '1.4.0',
      manifest_version: 3,
      name: '',
    });

    // Trigger the onInstalled event with UPDATE reason and previous version 1.3.0
    onInstalledListener({
      reason: 'update',
      previousVersion: '1.3.0',
    } as Runtime.InstalledDetails);

    // Ensure the version logging occurs
    expect(console.info).toHaveBeenCalledWith('Previous Version: 1.3.0');
    expect(console.info).toHaveBeenCalledWith('Current Version: 1.4.0');

    // Check that showReadme is called for the update
    expect(chrome.tabs.create).toHaveBeenCalled();
  });

  it('should NOT log versions and call showReadme when there is no update', () => {
    jest.spyOn(chrome.runtime, 'getManifest').mockReturnValue({
      version: '1.4.0',
      manifest_version: 3,
      name: '',
    });

    (chrome.runtime as any).OnInstalledReason = {};

    // Trigger the onInstalled event with UPDATE reason and previous version 1.3.0
    onInstalledListener({
      reason: 'update',
      previousVersion: '1.3.0',
    } as Runtime.InstalledDetails);

    // Ensure the version logging occurs
    expect(console.info).toHaveBeenCalledWith('Previous Version: 1.3.0');
    expect(console.info).toHaveBeenCalledWith('Current Version: 1.4.0');

    // Check that showReadme is called for the update
    expect(chrome.tabs.create).not.toHaveBeenCalled();
  });

  it('should NOT log versions and call showReadme when the previous version is not 1.3.0', () => {
    jest.spyOn(chrome.runtime, 'getManifest').mockReturnValue({
      version: '1.4.0',
      manifest_version: 3,
      name: '',
    });

    (chrome.runtime as any).OnInstalledReason = {};

    // Trigger the onInstalled event with UPDATE reason and previous version 1.3.0
    onInstalledListener({
      reason: 'update',
      previousVersion: '1.2.0',
    } as Runtime.InstalledDetails);

    // Ensure the version logging occurs
    expect(console.info).toHaveBeenCalledWith('Previous Version: 1.2.0');
    expect(console.info).toHaveBeenCalledWith('Current Version: 1.4.0');

    // Check that showReadme is called for the update
    expect(chrome.tabs.create).not.toHaveBeenCalled();
  });

  it('should NOT log versions and call showReadme when the previous version the same as the current version', () => {
    jest.spyOn(chrome.runtime, 'getManifest').mockReturnValue({
      version: '1.4.0',
      manifest_version: 3,
      name: '',
    });

    (chrome.runtime as any).OnInstalledReason = {};

    // Trigger the onInstalled event with UPDATE reason and previous version 1.3.0
    onInstalledListener({
      reason: 'update',
      previousVersion: '1.4.0',
    } as Runtime.InstalledDetails);

    // Ensure the version logging occurs
    expect(console.info).toHaveBeenCalledWith('Previous Version: 1.4.0');
    expect(console.info).toHaveBeenCalledWith('Current Version: 1.4.0');

    // Check that showReadme is called for the update
    expect(chrome.tabs.create).not.toHaveBeenCalled();
  });
});
