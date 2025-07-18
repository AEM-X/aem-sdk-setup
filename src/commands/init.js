const fs = require('fs-extra');
const path = require('path');
const { Command, Args, Flags } = require('@oclif/core');
const chalk = require('chalk');
const log = require('../utils/log');

/**
 * Initialize the default folder structure used by the setup command.
 * @module commands/init
 */
module.exports = class Init extends Command {
  static description = 'Create default setup directory structure';
  static flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show additional output',
      default: false,
    }),
  };
  static examples = ['aem-sdk-setup init', 'aem-sdk-setup init custom'];
  static args = {
    directory: Args.string({
      description: 'Directory to create the setup structure in',
      default: 'setup',
    }),
  };

  /**
   * Execute the command.
   * @returns {Promise<void>} resolves when folders are created
   */
  async run() {
    const { args, flags } = await this.parse(Init);
    const verbose = flags.verbose;
    const base = path.resolve(args.directory);
    const inputDir = path.join(base, 'input');
    const installDir = path.join(inputDir, 'install');
    const secretsDir = path.join(inputDir, 'secretsdir');
    const outputDir = path.join(base, 'output');

    await fs.ensureDir(installDir);
    await fs.ensureDir(secretsDir);

    if (verbose) {
      this.log(log.info(`Created ${inputDir}`));
      this.log(log.info(`Created ${installDir}`));
      this.log(log.info(`Created ${secretsDir}`));
    }
    this.log(log.info(chalk.bold('Place your AEM SDK files here.')));
    this.log(log.info(`Output will be written to ${outputDir}`));
  }
};
