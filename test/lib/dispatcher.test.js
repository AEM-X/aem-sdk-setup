const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const child_process = require('child_process');

jest.mock('fs-extra');
jest.mock('glob');
jest.mock('child_process');

const { installDispatcher } = require('../../src/lib/dispatcher');

afterEach(() => jest.resetAllMocks());

test('runs installer and moves directory', async () => {
  glob.sync
    .mockReturnValueOnce(['install.sh']) // installer
    .mockReturnValueOnce(['/tmp/dispatcher-sdk-test']);
  child_process.spawn.mockReturnValue({
    on: (event, cb) => event === 'close' && cb(0),
  });
  fs.pathExists.mockResolvedValue(true);
  await installDispatcher(
    'extracted',
    'aem-sdk-dispatcher-tools-',
    '/out',
    '/src',
  );
  expect(fs.chmod).toHaveBeenCalled();
  expect(fs.move).toHaveBeenCalledWith(
    '/tmp/dispatcher-sdk-test',
    path.join('/out', 'dispatcher'),
    { overwrite: true },
  );
  expect(fs.copy).toHaveBeenCalledWith(
    '/src',
    path.join('/out', 'dispatcher', 'src'),
  );
});

test('throws when installer missing', async () => {
  glob.sync.mockReturnValueOnce([]);
  await expect(
    installDispatcher('extracted', 'aem-sdk-dispatcher-tools-'),
  ).rejects.toThrow('installer script');
});
