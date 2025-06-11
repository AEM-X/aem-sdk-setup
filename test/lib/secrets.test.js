const fs = require('fs-extra');

jest.mock('fs-extra');

const { installSecrets } = require('../../src/lib/secrets');

afterEach(() => jest.resetAllMocks());

test('copies secrets when directory exists', async () => {
  fs.pathExists.mockResolvedValue(true);
  await installSecrets('/out');
  expect(fs.ensureDir).toHaveBeenCalledTimes(2);
  expect(fs.writeFile).toHaveBeenCalledTimes(2);
  expect(fs.copy).toHaveBeenCalledTimes(2);
});

test('skips copying when no secretsdir', async () => {
  fs.pathExists.mockResolvedValue(false);
  await installSecrets('/out');
  expect(fs.copy).not.toHaveBeenCalled();
});
