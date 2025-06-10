const fs = require('fs-extra');
const path = require('path');

const AUTHOR_CONF = 'instance/author/crx-quickstart/conf';
const PUBLISH_CONF = 'instance/publish/crx-quickstart/conf';
const AUTHOR_SECRETS = 'instance/author/crx-quickstart/secretsdir';
const PUBLISH_SECRETS = 'instance/publish/crx-quickstart/secretsdir';

/**
 * Install secrets configuration and copy secretsdir if present.
 */
async function installSecrets() {
  await fs.ensureDir(AUTHOR_CONF);
  await fs.writeFile(
    path.join(AUTHOR_CONF, 'sling.properties'),
    'org.apache.felix.configadmin.plugin.interpolation.secretsdir=${sling.home}/secretsdir',
  );
  await fs.ensureDir(PUBLISH_CONF);
  await fs.writeFile(
    path.join(PUBLISH_CONF, 'sling.properties'),
    'org.apache.felix.configadmin.plugin.interpolation.secretsdir=${sling.home}/secretsdir',
  );
  if (await fs.pathExists('secretsdir')) {
    await fs.copy('secretsdir', AUTHOR_SECRETS);
    await fs.copy('secretsdir', PUBLISH_SECRETS);
  }
}

module.exports = { installSecrets };
