const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

jest.mock('fs-extra');
jest.mock('glob');

const { installForms } = require('../../src/lib/forms');
const { extractZip } = require('../../src/lib/extraction');

jest.mock('../../src/lib/extraction', () => ({
  extractZip: jest.fn(() => Promise.resolve()),
}));

afterEach(() => {
  jest.resetAllMocks();
});

test('installs forms when far exists', async () => {
  fs.pathExists.mockResolvedValue(true);
  glob.sync.mockReturnValueOnce(['forms.far']);
  fs.ensureDir.mockResolvedValue();
  await installForms('forms.zip', '/out');
  expect(fs.pathExists).toHaveBeenCalledWith('forms.zip');
  expect(extractZip).toHaveBeenCalledWith(
    'forms.zip',
    path.join(process.cwd(), 'forms'),
  );
  expect(fs.copy).toHaveBeenCalledTimes(2);
  expect(fs.remove).toHaveBeenCalledWith(path.join(process.cwd(), 'forms'));
});

test('throws when far missing', async () => {
  fs.pathExists.mockResolvedValue(true);
  glob.sync.mockReturnValueOnce([]);
  fs.ensureDir.mockResolvedValue();
  fs.remove.mockResolvedValue();
  await expect(installForms('forms.zip')).rejects.toThrow('AEM Forms Archive');
});
