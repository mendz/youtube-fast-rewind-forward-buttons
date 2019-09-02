const fs = require('fs');

console.log(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  REPLACE INLINE SCRIPT TAG - NOT SUPPORTED IN CHROME EXTENSION
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);

const indexHtmlPath = 'build/index.html';
const buildJsFolder = 'build/static/js';

const dir = fs.readdirSync(buildJsFolder);
const runtimeFileName = dir.find(fileName => /^runtime.*\.js$/.test(fileName));

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

if (/<script>.*?<\/script>/.test(indexHtml)) {
  const newIndexHtmlString = indexHtml.replace(
    /<script>.*?<\/script>/,
    `<script src="/static/js/${runtimeFileName}"></script>`
  );

  fs.writeFileSync(indexHtmlPath, newIndexHtmlString);

  console.log(
    `'${indexHtmlPath}': updated! replace inline script with external. (${runtimeFileName})`
  );
} else {
  console.log(
    `'${indexHtmlPath}': have script with external, no need to update`
  );
}

console.log(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                          DONE!
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
