const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

jest.mock('fs-extra');
jest.mock('glob');

const Setup = require('../src/commands/setup');

const ROOT_OPTS = { root: path.join(__dirname, '..') };

describe('setup command', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('fails when SDK zip is missing', async () => {
    glob.sync.mockReturnValueOnce([]);
    fs.pathExists.mockResolvedValue(true);
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow('AEM SDK file');
  });

  test('fails when forms zip missing', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk-test.zip']) // SDK zip
      .mockReturnValueOnce(['quickstart.jar']) // jar file
      .mockReturnValue([]); // others
    fs.createReadStream.mockReturnValue({
      pipe: () => ({ promise: () => Promise.resolve() }),
    });
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    fs.pathExists.mockResolvedValueOnce(true).mockResolvedValue(false);
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest
        .fn()
        .mockResolvedValueOnce('no')
        .mockResolvedValueOnce('yes')
        .mockResolvedValueOnce('yes')
        .mockResolvedValueOnce('yes'),
      close: jest.fn(),
    });
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow(
      'AEM Forms addons ZIP file',
    );
  });
});
