const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const packageJsonLock = require('../package-lock.json');
const manifest = require('../src/manifest.json');

const newVersion = process.argv?.[2] ?? null;

console.log(process.argv);

console.info(`
provided version ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
version: ${newVersion}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);

if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Please provide a valid version argument
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  `);
  process.exit();
}

console.info(`
CURRENT VERSIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
packageJson version: ${packageJson.version}
packageJsonLock version ${packageJsonLock.version}
manifest version ${manifest.version}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);

packageJson.version = newVersion;
packageJsonLock.version = newVersion;
packageJsonLock.packages[''].version = newVersion;
manifest.version = newVersion;

fs.writeFileSync(
  path.resolve(__dirname, '../package.json'),
  JSON.stringify(packageJson, null, 2),
  'utf-8'
);
fs.writeFileSync(
  path.resolve(__dirname, '../package-lock.json'),
  JSON.stringify(packageJsonLock, null, 2),
  'utf-8'
);
fs.writeFileSync(
  path.resolve(__dirname, '../src/manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf-8'
);

console.info(`
NEW VERSIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
packageJson version: ${packageJson.version}
packageJsonLock version ${packageJsonLock.version}
manifest version ${manifest.version}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
