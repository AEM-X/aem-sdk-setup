const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

jest.mock('fs-extra');
jest.mock('glob');
jest.mock('../src/lib/extraction', () => ({
  extractZip: jest.fn(() => Promise.resolve()),
}));
jest.mock('../src/lib/forms', () => ({
  installForms: jest.fn(() => Promise.resolve()),
}));
jest.mock('../src/lib/secrets', () => ({
  installSecrets: jest.fn(() => Promise.resolve()),
}));
jest.mock('../src/lib/dispatcher', () => ({
  installDispatcher: jest.fn(() => Promise.resolve()),
}));
jest.mock('../src/lib/scripts', () => ({
  copyStartScripts: jest.fn(() => Promise.resolve()),
}));

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
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce([])
      .mockReturnValueOnce([]);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest.fn().mockResolvedValue('yes'),
      close: jest.fn(),
    });
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow(
      'AEM Forms addons ZIP file',
    );
  });

  test('fails when quickstart jar missing', async () => {
    glob.sync.mockReturnValueOnce(['aem-sdk.zip']).mockReturnValueOnce([]);
    fs.pathExists.mockResolvedValue(true);
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest.fn().mockResolvedValue('no'),
      close: jest.fn(),
    });
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow('Quickstart jar');
  });

  test('runs full install flow', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip']) // sdk
      .mockReturnValueOnce(['quickstart.jar']) // jar
      .mockReturnValueOnce([]) // install folder
      .mockReturnValueOnce(['aem-forms-addon.zip']);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest.fn().mockResolvedValue('yes'),
      close: jest.fn(),
    });
    await Setup.run([], ROOT_OPTS);
  });

  test('handles install folder files', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce(['extra.zip'])
      .mockReturnValueOnce(['aem-forms-addon.zip']);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest.fn().mockResolvedValue('yes'),
      close: jest.fn(),
    });
    await Setup.run([], ROOT_OPTS);
  });

  test('skips optional installs when answered no', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce([]);
    fs.pathExists
      .mockResolvedValueOnce(true) // target dir
      .mockResolvedValueOnce(false); // install folder
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest.fn().mockResolvedValue('no'),
      close: jest.fn(),
    });
    await Setup.run([], ROOT_OPTS);
  });
});
