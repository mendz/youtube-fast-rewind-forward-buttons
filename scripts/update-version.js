const fs = require('fs');
const path = require('path');
const packageJSON = require('../package.json');
const manifestJSON = require('../public/manifest.json');

const packageJSONPath = path.relative('../', '../package.json');
const manifestJSONPath = path.relative('../', '../public/manifest.json');

const version = process.argv[2];

console.log(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         UPDATE VERSION IN package.json AND manifest.json
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);

if (version && version.includes('.')) {
  console.log(`
  VERSION ARGUMENT: ${version}
  packageJSON.version: ${packageJSON.version}
  manifestJSON.version: ${manifestJSON.version}
`);

  packageJSON.version = version;
  manifestJSON.version = version;

  fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2));
  fs.writeFileSync(manifestJSONPath, JSON.stringify(manifestJSON, null, 2));

  console.log(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            DONE!
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
} else {
  console.error('ERROR: Need to provide a version like: "1.0.1"');
  process.exit();
}
