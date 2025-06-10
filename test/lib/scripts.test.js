const fs = require('fs-extra');

jest.mock('fs-extra');

const { copyStartScripts } = require('../../src/lib/scripts');

afterEach(() => jest.resetAllMocks());

test('copies existing scripts', async () => {
  fs.pathExists.mockResolvedValue(true);
  await copyStartScripts();
  expect(fs.copy).toHaveBeenCalledTimes(2);
});

test('skips when scripts missing', async () => {
  fs.pathExists.mockResolvedValue(false);
  await copyStartScripts();
  expect(fs.copy).not.toHaveBeenCalled();
});
