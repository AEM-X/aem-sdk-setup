/**
 * Utilities for installing the AEM Forms add-on.
 * @module lib/forms
 */
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { extractZip } = require('./extraction');
const { AUTHOR_INSTALL, PUBLISH_INSTALL } = require('./constants');

/**
 * Install the AEM Forms add-on from a ZIP file.
 * @param {string} formsZip path to the forms zip archive
 * @throws if the .far file cannot be located
 */
async function installForms(formsZip, outputDir = '.') {
  const formsDir = path.join(process.cwd(), path.basename(formsZip, '.zip'));
  await extractZip(formsZip, formsDir);
  const formsFar = glob.sync('*.far', { cwd: formsDir, absolute: true })[0];
  if (!formsFar) {
    throw new Error(
      'Error: AEM Forms Archive (.far) file not found within extracted directory.',
    );
  }
  await fs.copy(
    formsFar,
    path.join(outputDir, AUTHOR_INSTALL, path.basename(formsFar)),
  );
  await fs.copy(
    formsFar,
    path.join(outputDir, PUBLISH_INSTALL, path.basename(formsFar)),
  );
  await fs.remove(formsDir);
}

module.exports = { installForms };
