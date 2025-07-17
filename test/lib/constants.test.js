const c = require('../../src/lib/constants');

test('exports paths', () => {
  expect(c.AUTHOR_INSTALL).toBe('instance/author/crx-quickstart/install');
  expect(c.PUBLISH_SECRETS).toBe('instance/publish/crx-quickstart/secretsdir');
});
