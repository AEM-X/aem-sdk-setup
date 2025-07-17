const fs = require('fs-extra');
const path = require('path');

/**
 * Copy start scripts to their respective instance folders if present.
 */
async function copyStartScripts(outputDir = '.') {
  const scripts = ['start_author.sh', 'start_publish.sh'];
  await Promise.all(
    scripts.map(async (name) => {
      if (await fs.pathExists(name)) {
        const dest = path.join(
          outputDir,
          'instance',
          name.includes('author') ? 'author' : 'publish',
          name,
        );
        await fs.copy(name, dest);
      }
    }),
  );
}

module.exports = { copyStartScripts };
