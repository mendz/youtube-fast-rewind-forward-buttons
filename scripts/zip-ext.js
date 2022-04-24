const fs = require('fs');
const AdmZip = require('adm-zip');

const zip = new AdmZip();

const path = 'dist\\webext-dev';
const destZipPath = './dist/youtube-rewind-fastforward-buttons.zip';

/**
 * @param {string} filename
 * @returns {boolean}
 */
function isTsFile(filename) {
  const regexTsFiles = /.*\.ts/g;
  return regexTsFiles.test(filename);
}

function run() {
  if (fs.existsSync(destZipPath)) {
    console.info(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              BUILD CLEANING
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
    fs.unlinkSync(destZipPath);
    console.info(`'${destZipPath}' was deleted`);
  }

  console.info(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                ZIPPING...
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
  zip.addLocalFolder(path, '', (filename) => !isTsFile(filename));

  zip.writeZip(destZipPath, () =>
    console.info(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                  DONE!
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  OUTPUT: '${destZipPath}'
`)
  );
}
try {
  run();
} catch (error) {
  console.error(
    '\x1b[33m%s\x1b[0m',
    `
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                 ERROR!
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ${error.stack}
`
  );
}
