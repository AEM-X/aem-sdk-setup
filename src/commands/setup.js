const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const unzipper = require('unzipper');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');
const { Command, Flags } = require('@oclif/core');

/**
 * Root command for setting up an AEM SDK environment.
 *
 * This command extracts the SDK archives and optional add-ons found in the
 * current directory, configures secrets and dispatcher tools, and copies
 * helper start scripts. All actions are controlled via interactive prompts.
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

  /**
   * Execute the setup process. Prompts the user for desired components and
   * performs extraction and configuration steps.
   */
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
      await fs
        .createReadStream(sdkZip)
        .pipe(unzipper.Extract({ path: extractedDir }))
        .promise();

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
        this.log(
          "Copying ZIP files from 'install' to 'instance/author/crx-quickstart/install'...",
        );
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
      } else {
        this.warn("Warning: 'install' folder not found. No ZIP files copied.");
      }

      const rl = readline.createInterface({ input, output });
      const fullInstall = (
        await rl.question('Do you want a full installation? (yes/no): ')
      ).trim();
      let installForms, installSecrets, installDispatcher;
      if (fullInstall === 'yes') {
        installForms = 'yes';
        installSecrets = 'yes';
        installDispatcher = 'yes';
      } else {
        installForms = (
          await rl.question('Do you want to install AEM Forms? (yes/no): ')
        ).trim();
        installSecrets = (
          await rl.question('Do you want to install secrets? (yes/no): ')
        ).trim();
        installDispatcher = (
          await rl.question('Do you want to install AEM Dispatcher? (yes/no): ')
        ).trim();
      }
      rl.close();

      if (installForms === 'yes') {
        const formsZip = glob.sync(`${FORMS_PREFIX}*.zip`)[0];
        if (!formsZip) {
          this.error(
            `Error: AEM Forms addons ZIP file (${FORMS_PREFIX}*.zip) not found in the current directory.`,
          );
        }
        this.log(`Extracting AEM Forms addons ZIP file: ${formsZip}`);
        const formsDir = path.join(
          process.cwd(),
          path.basename(formsZip, '.zip'),
        );
        await fs
          .createReadStream(formsZip)
          .pipe(unzipper.Extract({ path: formsDir }))
          .promise();
        const formsFar = glob.sync('*.far', {
          cwd: formsDir,
          absolute: true,
        })[0];
        if (!formsFar) {
          this.error(
            'Error: AEM Forms Archive (.far) file not found within extracted directory.',
          );
        }
        await fs.copy(
          formsFar,
          path.join(
            'instance/author/crx-quickstart/install',
            path.basename(formsFar),
          ),
        );
        await fs.copy(
          formsFar,
          path.join(
            'instance/publish/crx-quickstart/install',
            path.basename(formsFar),
          ),
        );
      } else {
        this.log('Skipping AEM Forms installation.');
      }

      if (installSecrets === 'yes') {
        this.log('Installing secrets...');
        await fs.ensureDir('instance/author/crx-quickstart/conf');
        await fs.writeFile(
          'instance/author/crx-quickstart/conf/sling.properties',
          'org.apache.felix.configadmin.plugin.interpolation.secretsdir=${sling.home}/secretsdir',
        );
        await fs.ensureDir('instance/publish/crx-quickstart/conf');
        await fs.writeFile(
          'instance/publish/crx-quickstart/conf/sling.properties',
          'org.apache.felix.configadmin.plugin.interpolation.secretsdir=${sling.home}/secretsdir',
        );
        if (await fs.pathExists('secretsdir')) {
          await fs.copy(
            'secretsdir',
            'instance/author/crx-quickstart/secretsdir',
          );
          await fs.copy(
            'secretsdir',
            'instance/publish/crx-quickstart/secretsdir',
          );
        } else {
          this.warn(
            "Warning: 'secretsdir' folder not found. Secrets not installed.",
          );
        }
      } else {
        this.log('Skipping secrets installation.');
      }

      if (installDispatcher === 'yes') {
        const installer = glob.sync(`${DISPATCHER_PREFIX}*.sh`, {
          cwd: extractedDir,
        })[0];
        if (!installer) {
          this.error(
            `Error: AEM Dispatcher installer script (${DISPATCHER_PREFIX}*.sh) not found in the extracted AEM SDK directory.`,
          );
        }
        await fs.chmod(path.join(extractedDir, installer), 0o755);
        this.log(`Running AEM Dispatcher installer: ./${installer}`);
        await new Promise((resolve, reject) => {
          const child = require('child_process').spawn(`./${installer}`, {
            cwd: extractedDir,
            stdio: 'inherit',
            shell: true,
          });
          child.on('close', (code) =>
            code === 0
              ? resolve()
              : reject(
                  new Error(`dispatcher installer exited with code ${code}`),
                ),
          );
        });
        const dispatcherDir = glob.sync('dispatcher-sdk-*', {
          cwd: extractedDir,
          absolute: true,
        })[0];
        if (!dispatcherDir) {
          this.error(
            'Error: AEM Dispatcher configuration directory (dispatcher-sdk-*) not found.',
          );
        }
        await fs.move(dispatcherDir, 'dispatcher', { overwrite: true });
        this.log(
          `AEM Dispatcher configuration directory '${path.basename(dispatcherDir)}' renamed and moved to 'dispatcher'.`,
        );
      } else {
        this.log('Skipping AEM Dispatcher installation.');
      }

      for (const scriptName of ['start_author.sh', 'start_publish.sh']) {
        if (await fs.pathExists(scriptName)) {
          const dest = `instance/${scriptName.includes('author') ? 'author' : 'publish'}/${scriptName}`;
          await fs.copy(scriptName, dest);
          this.log(`Copying '${scriptName}' to '${path.dirname(dest)}/'...`);
        } else {
          this.warn(
            `Warning: '${scriptName}' not found. Cannot copy to '${scriptName.includes('author') ? 'instance/author/' : 'instance/publish/'}'.`,
          );
        }
      }

      this.log('AEM setup completed successfully.');
    } finally {
      process.chdir(originalDir);
    }
  }
};
