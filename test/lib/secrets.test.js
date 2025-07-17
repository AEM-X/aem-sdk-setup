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

test('throws when no secretsdir', async () => {
  fs.pathExists.mockResolvedValue(false);
  await expect(installSecrets('/out')).rejects.toThrow('secretsdir');
});
