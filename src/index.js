const path = require('path');
const { run, flush, handle } = require('@oclif/core');
const pjson = require('../oclif.config.json');

run(undefined, {
  root: path.join(__dirname, '..'),
  pjson,
})
  .then(flush)
  .catch(handle);
