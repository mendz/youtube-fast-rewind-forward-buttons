import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('before:browser:launch', (browser, launchOptions) => {
        // supply the absolute path to an unpacked extension's folder
        // NOTE: extensions cannot be loaded in headless Chrome
        launchOptions.extensions.push(
          'D:/Programing/workspace/my_projects/chrome-extensions/youtube-rewind-fastforward-buttons/dist/webext-dev'
        );

        return launchOptions;
      });
    },
    blockHosts: [
      'https://googleads.g.doubleclick.net',
      'https://accounts.google.com/',
      'https://www.gstatic.com',
      'https://fonts.gstatic.com',
      'https://accounts.youtube.com',
      'https://play.google.com',
    ],
  },
});
