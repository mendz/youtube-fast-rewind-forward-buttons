// This script fixes pico CSS paths in the manifest.json in the dist folder by replacing backslashes with forward slashes.
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const manifestPath = join(__dirname, '../dist/webext-dev/manifest.json');

console.info(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   FIXING PICO CSS PATHS IN MANIFEST
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);

try {
  if (!existsSync(manifestPath)) {
    throw new Error(`manifest.json not found: ${manifestPath}`);
  }

  let manifestText = readFileSync(manifestPath, 'utf8');
  // Replace backslashes with forward slashes in pico CSS paths
   // Matches any path containing "css\\pico\\"
  const picoPathRegex = /("css\\pico\\[^"]*)/g;
  let changed = false;
  manifestText = manifestText.replaceAll(picoPathRegex, (match) => {
    changed = true;
    return match.replace(/\\/g, '/');
  });

  if (changed) {
    writeFileSync(manifestPath, manifestText, 'utf8');
    console.info(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   Pico CSS paths fixed in manifest.json
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
  } else {
    console.info(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   No pico CSS paths needed fixing.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
  }
} catch (error) {
  console.error(
    `\x1b[33m%s\x1b[0m`,
    `
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   ERROR FIXING PICO CSS PATHS
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
${error.stack}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`
  );
  process.exit(1);
}
