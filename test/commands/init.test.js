const path = require('path');
const fs = require('fs-extra');

jest.mock('fs-extra');

const Init = require('../../src/commands/init');

const ROOT_OPTS = { root: path.join(__dirname, '..', '..') };

afterEach(() => jest.resetAllMocks());

test('creates default structure', async () => {
  const log = jest.spyOn(Init.prototype, 'log').mockImplementation();
  await Init.run(['--verbose'], ROOT_OPTS);
  expect(fs.ensureDir).toHaveBeenCalledWith(
    path.join(process.cwd(), 'setup/input/install'),
  );
  expect(fs.ensureDir).toHaveBeenCalledWith(
    path.join(process.cwd(), 'setup/input/secretsdir'),
  );
  expect(log).toHaveBeenCalledWith(
    expect.stringContaining(
      `[INFO] Created ${path.join(process.cwd(), 'setup/input')}`,
    ),
  );
  expect(log).toHaveBeenCalledWith(
    expect.stringContaining('[INFO] Place your AEM SDK files here.'),
  );
  expect(log).toHaveBeenCalledWith(
    expect.stringContaining(
      `Output will be written to ${path.join(process.cwd(), 'setup/output')}`,
    ),
  );
});

test('accepts custom directory', async () => {
  const log = jest.spyOn(Init.prototype, 'log').mockImplementation();
  await Init.run(['custom', '--verbose'], ROOT_OPTS);
  expect(fs.ensureDir).toHaveBeenCalledWith(
    path.join(process.cwd(), 'custom/input/install'),
  );
  expect(fs.ensureDir).toHaveBeenCalledWith(
    path.join(process.cwd(), 'custom/input/secretsdir'),
  );
  expect(log).toHaveBeenCalledWith(
    expect.stringContaining(
      `[INFO] Created ${path.join(process.cwd(), 'custom/input')}`,
    ),
  );
});
