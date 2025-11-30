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
  fs.pathExists
    .mockResolvedValueOnce(true) // extractedDir check
    .mockResolvedValueOnce(true); // src path check
  glob.sync
    .mockReturnValueOnce(['install.sh']) // installer
    .mockReturnValueOnce(['/tmp/dispatcher-sdk-test']);
  child_process.spawn.mockReturnValue({
    on: (event, cb) => event === 'close' && cb(0),
  });
  fs.ensureDir.mockResolvedValue();
  await installDispatcher(
    'extracted',
    'aem-sdk-dispatcher-tools-',
    '/out',
    '/src',
  );
  expect(child_process.spawn).toHaveBeenCalledWith(
    process.platform === 'win32' ? 'bash' : 'sh',
    ['install.sh'],
    expect.objectContaining({ cwd: 'extracted', stdio: 'inherit' }),
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
  fs.pathExists.mockResolvedValue(true);
  glob.sync.mockReturnValueOnce([]);
  await expect(
    installDispatcher('extracted', 'aem-sdk-dispatcher-tools-'),
  ).rejects.toThrow('installer script');
});

test('throws when dispatcher directory missing', async () => {
  fs.pathExists.mockResolvedValue(true);
  glob.sync.mockReturnValueOnce(['install.sh']).mockReturnValueOnce([]);
  child_process.spawn.mockReturnValue({
    on: (event, cb) => event === 'close' && cb(0),
  });
  await expect(
    installDispatcher('extracted', 'aem-sdk-dispatcher-tools-'),
  ).rejects.toThrow('Dispatcher configuration directory');
});

test('throws when installer exits non-zero', async () => {
  fs.pathExists.mockResolvedValue(true);
  glob.sync
    .mockReturnValueOnce(['install.sh'])
    .mockReturnValueOnce(['/tmp/dispatcher-sdk-test']);
  child_process.spawn.mockReturnValue({
    on: (event, cb) => event === 'close' && cb(1),
  });
  await expect(
    installDispatcher('extracted', 'aem-sdk-dispatcher-tools-'),
  ).rejects.toThrow('dispatcher installer exited with code 1');
});

test('skips src copy when not provided', async () => {
  fs.pathExists
    .mockResolvedValueOnce(true) // extractedDir check
    .mockResolvedValueOnce(false); // src path check
  glob.sync
    .mockReturnValueOnce(['install.sh'])
    .mockReturnValueOnce(['/tmp/dispatcher-sdk-test']);
  child_process.spawn.mockReturnValue({
    on: (event, cb) => event === 'close' && cb(0),
  });
  fs.ensureDir.mockResolvedValue();
  await installDispatcher('extracted', 'aem-sdk-dispatcher-tools-', '/out');
  expect(fs.copy).not.toHaveBeenCalled();
});
