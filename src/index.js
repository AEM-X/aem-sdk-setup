const { run, flush, handle } = require('@oclif/core');

run(undefined, {
  root: __dirname,
  pjson: {
    name: 'aem-sdk-setup',
    version: '1.0.0',
    bin: 'aem-sdk-setup',
    oclif: {
      commands: { strategy: 'single', target: 'src/commands/setup.js' },
    },
  },
})
  .then(flush)
  .catch(handle);
