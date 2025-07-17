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
  glob.sync.mockReturnValueOnce([]);
  await expect(
    installDispatcher('extracted', 'aem-sdk-dispatcher-tools-'),
  ).rejects.toThrow('installer script');
});

test('throws when dispatcher directory missing', async () => {
  glob.sync.mockReturnValueOnce(['install.sh']).mockReturnValueOnce([]);
  child_process.spawn.mockReturnValue({
    on: (event, cb) => event === 'close' && cb(0),
  });
  await expect(
    installDispatcher('extracted', 'aem-sdk-dispatcher-tools-'),
  ).rejects.toThrow('Dispatcher configuration directory');
});

test('throws when installer exits non-zero', async () => {
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
  glob.sync
    .mockReturnValueOnce(['install.sh'])
    .mockReturnValueOnce(['/tmp/dispatcher-sdk-test']);
  child_process.spawn.mockReturnValue({
    on: (event, cb) => event === 'close' && cb(0),
  });
  fs.pathExists.mockResolvedValue(false);
  await installDispatcher('extracted', 'aem-sdk-dispatcher-tools-', '/out');
  expect(fs.copy).not.toHaveBeenCalled();
});

test('uses bash on windows', async () => {
  glob.sync
    .mockReturnValueOnce(['install.sh'])
    .mockReturnValueOnce(['/tmp/dispatcher-sdk-test']);
  child_process.spawn.mockReturnValue({
    on: (event, cb) => event === 'close' && cb(0),
  });
  const orig = process.platform;
  Object.defineProperty(process, 'platform', { value: 'win32' });
  await installDispatcher('extracted', 'aem-sdk-dispatcher-tools-', '/out');
  expect(child_process.spawn).toHaveBeenCalledWith(
    'bash',
    ['install.sh'],
    expect.objectContaining({ cwd: 'extracted', stdio: 'inherit' }),
  );
  Object.defineProperty(process, 'platform', { value: orig });
});
