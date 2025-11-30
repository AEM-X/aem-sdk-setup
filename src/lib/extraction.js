const fs = require('fs-extra');
const unzipper = require('unzipper');

/**
 * Extracts a ZIP archive to a destination folder.
 *
 * @param {string} src - Path to the ZIP file to extract
 * @param {string} dest - Destination directory where files will be extracted
 * @returns {Promise<void>} Resolves when extraction is completed
 * @throws {Error} If the source file doesn't exist or extraction fails
 *
 * @example
 * await extractZip('./aem-sdk-2024.1.zip', './extracted');
 */
async function extractZip(src, dest) {
  if (!src || typeof src !== 'string') {
    throw new Error('Source path must be a non-empty string');
  }
  if (!dest || typeof dest !== 'string') {
    throw new Error('Destination path must be a non-empty string');
  }
  if (!(await fs.pathExists(src))) {
    throw new Error(`Source file does not exist: ${src}`);
  }
  await fs.ensureDir(dest);
  await fs
    .createReadStream(src)
    .pipe(unzipper.Extract({ path: dest }))
    .promise();
}

module.exports = { extractZip };
