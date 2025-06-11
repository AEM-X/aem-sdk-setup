const { run } = require('@oclif/core');

module.exports = run;

if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
