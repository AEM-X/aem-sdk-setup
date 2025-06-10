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
  glob.sync.mockReturnValueOnce(['forms.far']);
  await installForms('forms.zip');
  expect(extractZip).toHaveBeenCalledWith(
    'forms.zip',
    path.join(process.cwd(), 'forms'),
  );
  expect(fs.copy).toHaveBeenCalledTimes(2);
});

test('throws when far missing', async () => {
  glob.sync.mockReturnValueOnce([]);
  await expect(installForms('forms.zip')).rejects.toThrow('AEM Forms Archive');
});
