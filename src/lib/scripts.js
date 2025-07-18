/**
 * Utilities for managing instance start scripts.
 * @module lib/scripts
 */
const fs = require('fs-extra');
const path = require('path');

/**
 * Copy or create start scripts for the instances.
 * If a script exists in the current directory it is copied, otherwise a
 * default script is generated pointing to the provided jar file.
 *
 * @param {string} outputDir destination directory
 * @param {string} authorJar jar file name for the author instance
 * @param {string} publishJar jar file name for the publish instance
 */
async function copyStartScripts(outputDir = '.', authorJar, publishJar) {
  const scripts = [
    {
      name: 'start_author.sh',
      jar: authorJar,
      cmd: `java  -jar ${authorJar}  -r author,dynamicmedia_scene7 -fork -forkargs -- -Xdebug -Xrunjdwp:transport=dt_socket,address=9999,suspend=n,server=y -Xms1536m -Xmx3072m -XX:MaxMetaspaceSize=512m`,
      folder: 'author',
    },
    {
      name: 'start_publish.sh',
      jar: publishJar,
      cmd: `java  -jar ${publishJar}  -r publish,dynamicmedia_scene7 -fork -forkargs -- -Xdebug -Xrunjdwp:transport=dt_socket,address=9998,suspend=n,server=y -Xms1536m -Xmx3072m -XX:MaxMetaspaceSize=512m`,
      folder: 'publish',
    },
  ];

  for (const script of scripts) {
    const dest = path.join(outputDir, 'instance', script.folder, script.name);
    if (await fs.pathExists(script.name)) {
      await fs.copy(script.name, dest);
    } else if (script.jar) {
      await fs.outputFile(dest, script.cmd);
      await fs.chmod(dest, 0o755);
    }
  }
}

module.exports = { copyStartScripts };
