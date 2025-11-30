const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { extractZip } = require('./extraction');

const AUTHOR_INSTALL = 'instance/author/crx-quickstart/install';
const PUBLISH_INSTALL = 'instance/publish/crx-quickstart/install';

/**
 * Installs the AEM Forms add-on from a ZIP file.
 *
 * This function extracts the Forms ZIP archive, locates the .far (Forms Archive)
 * file, and copies it to both the author and publish instance install directories.
 * The temporary extraction directory is cleaned up after installation.
 *
 * @param {string} formsZip - Path to the AEM Forms add-on ZIP archive
 * @param {string} [outputDir='.'] - Output directory where instances are located
 * @returns {Promise<void>} Resolves when installation is completed
 * @throws {Error} If the formsZip path is invalid, the .far file cannot be located, or installation fails
 *
 * @example
 * await installForms('./aem-forms-addon-2024.1.zip', './output');
 */
async function installForms(formsZip, outputDir = '.') {
  if (!formsZip || typeof formsZip !== 'string') {
    throw new Error('Forms ZIP path must be a non-empty string');
  }
  if (!(await fs.pathExists(formsZip))) {
    throw new Error(`Forms ZIP file does not exist: ${formsZip}`);
  }
  const formsDir = path.join(process.cwd(), path.basename(formsZip, '.zip'));
  await extractZip(formsZip, formsDir);
  const formsFar = glob.sync('*.far', { cwd: formsDir, absolute: true })[0];
  if (!formsFar) {
    await fs.remove(formsDir).catch(() => {
      // Ignore cleanup errors if extraction failed
    });
    throw new Error(
      'Error: AEM Forms Archive (.far) file not found within extracted directory.',
    );
  }
  await fs.ensureDir(path.join(outputDir, AUTHOR_INSTALL));
  await fs.ensureDir(path.join(outputDir, PUBLISH_INSTALL));
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
