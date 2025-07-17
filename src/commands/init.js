const fs = require('fs-extra');
const path = require('path');
const { Command, Args } = require('@oclif/core');
const log = require('../utils/log');

/**
 * Initialize the default folder structure used by the setup command.
 */
module.exports = class Init extends Command {
  static description = 'Create default setup directory structure';
  static args = {
    directory: Args.string({
      description: 'Directory to create the setup structure in',
      default: 'setup',
    }),
  };

  async run() {
    const { args } = await this.parse(Init);
    const base = path.resolve(args.directory);
    const inputDir = path.join(base, 'input');
    const installDir = path.join(inputDir, 'install');
    const secretsDir = path.join(inputDir, 'secretsdir');
    const outputDir = path.join(base, 'output');

    await fs.ensureDir(installDir);
    await fs.ensureDir(secretsDir);

    this.log(log.info(`Created ${inputDir}`));
    this.log(log.info('Place your AEM SDK files here.'));
    this.log(log.info(`Output will be written to ${outputDir}`));
  }
};
