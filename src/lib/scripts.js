const fs = require('fs-extra');
const path = require('path');

const START_SCRIPTS = ['start_author.sh', 'start_publish.sh'];

/**
 * Copies start scripts to their respective instance folders if present.
 *
 * This function looks for `start_author.sh` and `start_publish.sh` in the
 * current working directory. If found, they are copied to the corresponding
 * instance directories (author or publish) within the output directory.
 *
 * @param {string} [outputDir='.'] - Output directory where instances are located
 * @returns {Promise<void>} Resolves when copying is completed (or skipped if scripts don't exist)
 *
 * @example
 * await copyStartScripts('./output');
 */
async function copyStartScripts(outputDir = '.') {
  for (const scriptName of START_SCRIPTS) {
    if (await fs.pathExists(scriptName)) {
      const dest = path.join(
        outputDir,
        'instance',
        scriptName.includes('author') ? 'author' : 'publish',
        scriptName,
      );
      await fs.copy(scriptName, dest);
    }
  }
}

module.exports = { copyStartScripts };
