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
  const instances = [
    { conf: AUTHOR_CONF, secrets: AUTHOR_SECRETS },
    { conf: PUBLISH_CONF, secrets: PUBLISH_SECRETS },
  ];

  await Promise.all(
    instances.map(async ({ conf }) => {
      const dir = path.join(outputDir, conf);
      await fs.ensureDir(dir);
      await fs.writeFile(
        path.join(dir, 'sling.properties'),
        'org.apache.felix.configadmin.plugin.interpolation.secretsdir=${sling.home}/secretsdir',
      );
    }),
  );

  if (await fs.pathExists('secretsdir')) {
    await Promise.all(
      instances.map(({ secrets }) =>
        fs.copy('secretsdir', path.join(outputDir, secrets)),
      ),
    );
  }
}

module.exports = { installSecrets };
