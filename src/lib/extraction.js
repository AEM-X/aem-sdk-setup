const fs = require('fs-extra');
const unzipper = require('unzipper');

/**
 * Extract a ZIP archive to a destination folder.
 * @param {string} src path to the zip file
 * @param {string} dest extraction destination
 * @returns {Promise<void>} resolves when extraction completed
 */
async function extractZip(src, dest) {
  await fs
    .createReadStream(src)
    .pipe(unzipper.Extract({ path: dest }))
    .promise();
}

module.exports = { extractZip };
