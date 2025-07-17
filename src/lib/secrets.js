const fs = require('fs-extra');
const path = require('path');

const {
  AUTHOR_CONF,
  PUBLISH_CONF,
  AUTHOR_SECRETS,
  PUBLISH_SECRETS,
} = require('./constants');

/**
 * Install secrets configuration and copy secretsdir if present.
 */
async function installSecrets(outputDir = '.') {
  await fs.ensureDir(path.join(outputDir, AUTHOR_CONF));
  await fs.writeFile(
    path.join(outputDir, AUTHOR_CONF, 'sling.properties'),
    'org.apache.felix.configadmin.plugin.interpolation.secretsdir=${sling.home}/secretsdir',
  );
  await fs.ensureDir(path.join(outputDir, PUBLISH_CONF));
  await fs.writeFile(
    path.join(outputDir, PUBLISH_CONF, 'sling.properties'),
    'org.apache.felix.configadmin.plugin.interpolation.secretsdir=${sling.home}/secretsdir',
  );
  if (!(await fs.pathExists('secretsdir')))
    throw new Error('secretsdir directory not found');

  await fs.copy('secretsdir', path.join(outputDir, AUTHOR_SECRETS));
  await fs.copy('secretsdir', path.join(outputDir, PUBLISH_SECRETS));
}

module.exports = { installSecrets };
