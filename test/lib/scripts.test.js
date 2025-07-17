const fs = require('fs-extra');

jest.mock('fs-extra');

const { copyStartScripts } = require('../../src/lib/scripts');

afterEach(() => jest.resetAllMocks());

test('copies existing scripts', async () => {
  fs.pathExists.mockResolvedValue(true);
  await copyStartScripts('/out', 'a.jar', 'b.jar');
  expect(fs.copy).toHaveBeenCalledTimes(2);
});

test('creates defaults when scripts missing', async () => {
  fs.pathExists.mockResolvedValue(false);
  await copyStartScripts('/out', 'a.jar', 'b.jar');
  expect(fs.outputFile).toHaveBeenCalledTimes(2);
  expect(fs.chmod).toHaveBeenCalledTimes(2);
});
