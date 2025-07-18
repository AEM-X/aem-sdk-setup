const log = require('../../src/utils/log');

test('prefixes info messages', () => {
  expect(log.info('test')).toContain('[INFO] test');
});

test('prefixes warnings', () => {
  expect(log.warn('warn')).toContain('[WARN] warn');
});

test('prefixes errors', () => {
  expect(log.error('boom')).toContain('[ERROR] boom');
});
