 npm init playwright 
Need to install the following packages:
  create-playwright
Ok to proceed? (y) y
Getting started with writing end-to-end tests with Playwright:
Initializing project in '.'
√ Where to put your end-to-end tests? · e2e-tests
√ Add a GitHub Actions workflow? (y/N) · true
Installing Playwright Test (npm install --save-dev @playwright/test)…

added 2 packages, and audited 859 packages in 3s

196 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
Downloading browsers (npx playwright install)…
Downloading Chromium 105.0.5195.19 (playwright build v1019) - 106.3 Mb [====================] 100% 0.0s
Chromium 105.0.5195.19 (playwright build v1019) downloaded to C:\Users\User\AppData\Local\ms-playwright\chromium-1019
Downloading FFMPEG playwright build v1007 - 1.4 Mb [====================] 100% 0.0s
FFMPEG playwright build v1007 downloaded to C:\Users\User\AppData\Local\ms-playwright\ffmpeg-1007
Downloading Firefox 103.0 (playwright build v1344) - 76.4 Mb [====================] 100% 0.0s
Firefox 103.0 (playwright build v1344) downloaded to C:\Users\User\AppData\Local\ms-playwright\firefox-1344
Downloading Webkit 16.0 (playwright build v1699) - 43.3 Mb [====================] 100% 0.0s
Webkit 16.0 (playwright build v1699) downloaded to C:\Users\User\AppData\Local\ms-playwright\webkit-1699
Writing playwright.config.ts.
Writing .github\workflows\playwright.yml.
Writing e2e-tests\example.spec.ts.       
Writing tests-examples\demo-todo-app.spec.ts.

Inside that directory, you can run several commands:

  npx playwright test
    Runs the end-to-end tests.

  npx playwright test --project=chromium
    Runs the tests only on Desktop Chrome.

  npx playwright test example
    Runs the tests in a specific file.

  npx playwright test --debug
    Runs the tests in debug mode.

  npx playwright codegen
    Auto generate tests with Codegen.

We suggest that you begin by typing:

    npx playwright test

And check out the following files:
  - .\e2e-tests\example.spec.ts - Example end-to-end test
  - .\tests-examples\demo-todo-app.spec.ts - Demo Todo App end-to-end tests
  - .\playwright.config.ts - Playwright Test configuration

Visit https://playwright.dev/docs/intro for more information. ✨

Happy hacking! 🎭