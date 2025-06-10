const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');
const { Command, Flags } = require('@oclif/core');
const { extractZip } = require('../lib/extraction');
const { installForms } = require('../lib/forms');
const { installSecrets } = require('../lib/secrets');
const { installDispatcher } = require('../lib/dispatcher');
const { copyStartScripts } = require('../lib/scripts');

/**
 * Root command for setting up an AEM SDK environment.
 * It extracts the SDK archives, installs optional components and copies helper scripts.
 */
module.exports = class Setup extends Command {
  static description = 'Set up AEM SDK environment';
  static flags = {
    directory: Flags.string({
      char: 'd',
      description: 'Directory containing the AEM SDK files',
      default: '.',
    }),
  };

  async run() {
    const { flags } = await this.parse(Setup);
    const targetDir = path.resolve(flags.directory);
    if (!(await fs.pathExists(targetDir))) {
      this.error(`Directory not found: ${targetDir}`);
    }
    const originalDir = process.cwd();
    process.chdir(targetDir);
    try {
      const SDK_PREFIX = 'aem-sdk-';
      const FORMS_PREFIX = 'aem-forms-addon-';
      const DISPATCHER_PREFIX = 'aem-sdk-dispatcher-tools-';
      const AUTHOR_PORT = 4502;
      const PUBLISH_PORT = 4503;

      const sdkZip = glob.sync(`${SDK_PREFIX}*.zip`)[0];
      if (!sdkZip) {
        this.error(
          `Error: AEM SDK file (${SDK_PREFIX}*.zip) not found in the current directory.`,
        );
      }

      this.log(`Extracting AEM SDK file: ${sdkZip}`);
      const extractedDir = path.join(
        process.cwd(),
        path.basename(sdkZip, '.zip'),
      );
      await extractZip(sdkZip, extractedDir);

      await fs.ensureDir('instance/author/crx-quickstart/install');
      await fs.ensureDir('instance/publish/crx-quickstart/install');

      const jarPattern = `${SDK_PREFIX}quickstart-*.jar`;
      const jar = glob.sync(jarPattern, { cwd: extractedDir })[0];
      if (!jar) {
        this.error(
          `Error: Quickstart jar (${jarPattern}) not found in ${extractedDir}`,
        );
      }
      await fs.copy(
        path.join(extractedDir, jar),
        `instance/author/aem-author-p${AUTHOR_PORT}.jar`,
      );
      await fs.copy(
        path.join(extractedDir, jar),
        `instance/publish/aem-publish-p${PUBLISH_PORT}.jar`,
      );

      if (await fs.pathExists('install')) {
        for (const file of glob.sync('*.zip', { cwd: 'install' })) {
          await fs.copy(
            path.join('install', file),
            path.join('instance/author/crx-quickstart/install', file),
          );
          await fs.copy(
            path.join('install', file),
            path.join('instance/publish/crx-quickstart/install', file),
          );
        }
      }

      const rl = readline.createInterface({ input, output });
      const fullInstall = (
        await rl.question('Do you want a full installation? (yes/no): ')
      ).trim();
      let installFormsChoice, installSecretsChoice, installDispatcherChoice;
      if (fullInstall === 'yes') {
        installFormsChoice = 'yes';
        installSecretsChoice = 'yes';
        installDispatcherChoice = 'yes';
      } else {
        installFormsChoice = (
          await rl.question('Do you want to install AEM Forms? (yes/no): ')
        ).trim();
        installSecretsChoice = (
          await rl.question('Do you want to install secrets? (yes/no): ')
        ).trim();
        installDispatcherChoice = (
          await rl.question('Do you want to install AEM Dispatcher? (yes/no): ')
        ).trim();
      }
      rl.close();

      if (installFormsChoice === 'yes') {
        const formsZip = glob.sync(`${FORMS_PREFIX}*.zip`)[0];
        if (!formsZip) {
          this.error(
            `Error: AEM Forms addons ZIP file (${FORMS_PREFIX}*.zip) not found in the current directory.`,
          );
        }
        this.log(`Extracting AEM Forms addons ZIP file: ${formsZip}`);
        await installForms(formsZip);
      }

      if (installSecretsChoice === 'yes') {
        await installSecrets();
      }

      if (installDispatcherChoice === 'yes') {
        await installDispatcher(extractedDir, DISPATCHER_PREFIX);
      }

      await copyStartScripts();
      this.log('AEM setup completed successfully.');
    } finally {
      process.chdir(originalDir);
    }
  }
};
