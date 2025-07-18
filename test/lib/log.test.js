const log = require('../../src/utils/log');

test('prefixes info messages', () => {
  expect(log.info('test')).toBe('aem-sdk-setup: [INFO] test');
});

test('prefixes warnings', () => {
  expect(log.warn('warn')).toBe('aem-sdk-setup: [WARN] warn');
});

test('prefixes errors', () => {
  expect(log.error('boom')).toBe('aem-sdk-setup: [ERROR] boom');
});
