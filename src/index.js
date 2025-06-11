const { run } = require('@oclif/core');

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
