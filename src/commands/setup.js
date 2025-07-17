const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');
const { Command, Flags, ux } = require('@oclif/core');
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
    output: Flags.string({
      char: 'o',
      description: 'Output directory for the generated instance',
      default: 'output',
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
    const outputDir = path.resolve(targetDir, flags.output);
    try {
      const SDK_PREFIX = 'aem-sdk-';
      const FORMS_PREFIX = 'aem-forms-addon-';
      const DISPATCHER_PREFIX = 'aem-sdk-dispatcher-tools-';
      const AUTHOR_PORT = 4502;
      const PUBLISH_PORT = 4503;
      let authorJar;
      let publishJar;

      const sdkZip = glob.sync(`${SDK_PREFIX}*.zip`)[0];
      if (!sdkZip) {
        this.error(
          `Error: AEM SDK file (${SDK_PREFIX}*.zip) not found in the current directory.`,
        );
      }

      ux.action.start(`Extracting AEM SDK file ${sdkZip}`);
      const extractedDir = path.join(
        process.cwd(),
        path.basename(sdkZip, '.zip'),
      );
      await extractZip(sdkZip, extractedDir);
      ux.action.stop();

      await fs.ensureDir(
        path.join(outputDir, 'instance/author/crx-quickstart/install'),
      );
      await fs.ensureDir(
        path.join(outputDir, 'instance/publish/crx-quickstart/install'),
      );

      const jarPattern = `${SDK_PREFIX}quickstart-*.jar`;
      const jar = glob.sync(jarPattern, { cwd: extractedDir })[0];
      if (!jar) {
        this.error(
          `Error: Quickstart jar (${jarPattern}) not found in ${extractedDir}`,
        );
      }
      const version = jar.replace(/^.*quickstart-(.*)\.jar$/, '$1');
      authorJar = `aem-author-p${AUTHOR_PORT}-${version}.jar`;
      publishJar = `aem-publish-p${PUBLISH_PORT}-${version}.jar`;
      await fs.copy(
        path.join(extractedDir, jar),
        path.join(outputDir, `instance/author/${authorJar}`),
      );
      await fs.copy(
        path.join(extractedDir, jar),
        path.join(outputDir, `instance/publish/${publishJar}`),
      );

      if (await fs.pathExists('install')) {
        ux.action.start('Copying install content packages');
        for (const file of glob.sync('*.zip', { cwd: 'install' })) {
          await fs.copy(
            path.join('install', file),
            path.join(
              outputDir,
              'instance/author/crx-quickstart/install',
              file,
            ),
          );
          await fs.copy(
            path.join('install', file),
            path.join(
              outputDir,
              'instance/publish/crx-quickstart/install',
              file,
            ),
          );
        }
        ux.action.stop();
      }

      const rl = readline.createInterface({ input, output });
      const fullInstallAnswer = (
        await rl.question('Do you want a full installation? (y/N): ')
      )
        .trim()
        .toLowerCase();
      const fullInstall =
        fullInstallAnswer === 'y' || fullInstallAnswer === 'yes';
      let installFormsChoice, installSecretsChoice, installDispatcherChoice;
      if (fullInstall) {
        installFormsChoice = 'yes';
        installSecretsChoice = 'yes';
        installDispatcherChoice = 'yes';
      } else {
        installFormsChoice = (
          await rl.question('Do you want to install AEM Forms? (yes/no): ')
        )
          .trim()
          .toLowerCase();
        installSecretsChoice = (
          await rl.question('Do you want to install secrets? (yes/no): ')
        )
          .trim()
          .toLowerCase();
        installDispatcherChoice = (
          await rl.question('Do you want to install AEM Dispatcher? (yes/no): ')
        )
          .trim()
          .toLowerCase();
      }
      let dispatcherSrc = '';
      if (installDispatcherChoice === 'yes') {
        dispatcherSrc = (
          await rl.question('Path to dispatcher src (leave blank to skip): ')
        ).trim();
      }
      if (installFormsChoice === 'yes') {
        const formsZip = glob.sync(`${FORMS_PREFIX}*.zip`)[0];
        if (!formsZip) {
          const reason = `AEM Forms addons ZIP file (${FORMS_PREFIX}*.zip) not found in the current directory.`;
          if (fullInstall) {
            this.warn(`Skipping AEM Forms installation: ${reason}`);
          } else {
            const cont = (await rl.question(`${reason} Continue? (y/N): `))
              .trim()
              .toLowerCase();
            if (cont !== 'y' && cont !== 'yes') {
              this.error(reason);
            }
          }
        } else {
          ux.action.start(`Extracting AEM Forms addons ZIP file ${formsZip}`);
          await installForms(formsZip, outputDir);
          ux.action.stop();
        }
      }

      if (installSecretsChoice === 'yes') {
        try {
          ux.action.start('Installing secrets');
          await installSecrets(outputDir);
          ux.action.stop();
        } catch (error) {
          ux.action.stop();
          const reason = error instanceof Error ? error.message : String(error);
          if (fullInstall) {
            this.warn(`Skipping secrets installation: ${reason}`);
          } else {
            const cont = (
              await rl.question(
                `Failed to install secrets (${reason}). Continue? (y/N): `,
              )
            )
              .trim()
              .toLowerCase();
            if (cont !== 'y' && cont !== 'yes') {
              this.error(reason);
            }
          }
        }
      }

      if (installDispatcherChoice === 'yes') {
        try {
          ux.action.start('Installing AEM Dispatcher');
          await installDispatcher(
            extractedDir,
            DISPATCHER_PREFIX,
            outputDir,
            dispatcherSrc,
          );
          ux.action.stop();
        } catch (error) {
          ux.action.stop();
          const reason = error instanceof Error ? error.message : String(error);
          if (fullInstall) {
            this.warn(`Skipping AEM Dispatcher installation: ${reason}`);
          } else {
            const cont = (
              await rl.question(
                `Error installing AEM Dispatcher (${reason}). Continue? (y/N): `,
              )
            )
              .trim()
              .toLowerCase();
            if (cont !== 'y' && cont !== 'yes') {
              this.error(reason);
            }
          }
        }
      }

      rl.close();

      await fs.remove(extractedDir);

      ux.action.start('Copying helper scripts');
      await copyStartScripts(outputDir, authorJar, publishJar);
      ux.action.stop();
      this.log('AEM setup completed successfully.');
    } catch (error) {
      this.error(error instanceof Error ? error.message : String(error));
    } finally {
      process.chdir(originalDir);
    }
  }
};
