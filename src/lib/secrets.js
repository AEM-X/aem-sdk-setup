const fs = require('fs-extra');
const path = require('path');

const AUTHOR_CONF = 'instance/author/crx-quickstart/conf';
const PUBLISH_CONF = 'instance/publish/crx-quickstart/conf';
const AUTHOR_SECRETS = 'instance/author/crx-quickstart/secretsdir';
const PUBLISH_SECRETS = 'instance/publish/crx-quickstart/secretsdir';

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
  if (await fs.pathExists('secretsdir')) {
    await fs.copy('secretsdir', path.join(outputDir, AUTHOR_SECRETS));
    await fs.copy('secretsdir', path.join(outputDir, PUBLISH_SECRETS));
  }
}

module.exports = { installSecrets };
