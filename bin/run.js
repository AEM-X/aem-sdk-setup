#!/usr/bin/env node

(async () => {
  const path = require('path');
  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    // Output only the CLI version and exit
    // eslint-disable-next-line global-require
    console.log(require('../package.json').version);
    return;
  }
  const oclif = await import('@oclif/core');
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exitCode = 1;
  });
  await oclif.execute({ dir: path.join(__dirname, '..') });
})();
