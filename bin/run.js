#!/usr/bin/env node

(async () => {
  const path = require('path');
  const oclif = await import('@oclif/core');
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exitCode = 1;
  });
  await oclif.execute({ dir: path.join(__dirname, '..') });
})();
