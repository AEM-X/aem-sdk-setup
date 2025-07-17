const fs = require('fs-extra');
const path = require('path');
const extract = require('extract-zip');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

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
    return;
  }

  if (await fs.pathExists('secretsdir.zip')) {
    const tmpDir = path.join(outputDir, 'secrets_tmp');
    await fs.ensureDir(tmpDir);
    try {
      try {
        await extract('secretsdir.zip', { dir: tmpDir });
      } catch (err) {
        const password = await hiddenPrompt('Password for secrets zip: ');
        await extract('secretsdir.zip', { dir: tmpDir, password });
      }
      await fs.copy(tmpDir, path.join(outputDir, AUTHOR_SECRETS));
      await fs.copy(tmpDir, path.join(outputDir, PUBLISH_SECRETS));
    } finally {
      await fs.remove(tmpDir);
    }
  }
}

async function hiddenPrompt(query) {
  const rl = readline.createInterface({ input, output, terminal: true });
  rl.stdoutMuted = true;
  rl._writeToOutput = function write() {
    if (rl.stdoutMuted) rl.output.write('*');
  };
  const answer = await new Promise((resolve) => rl.question(query, resolve));
  rl.output.write('\n');
  rl.close();
  return answer;
}

module.exports = { installSecrets, hiddenPrompt };
