const fs = require('fs-extra');
const path = require('path');

/**
 * Copy start scripts to their respective instance folders if present.
 */
async function copyStartScripts() {
  for (const scriptName of ['start_author.sh', 'start_publish.sh']) {
    if (await fs.pathExists(scriptName)) {
      const dest = `instance/${scriptName.includes('author') ? 'author' : 'publish'}/${scriptName}`;
      await fs.copy(scriptName, dest);
    }
  }
}

module.exports = { copyStartScripts };
