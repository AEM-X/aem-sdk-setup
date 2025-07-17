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

  test('fails when target directory missing', async () => {
    fs.pathExists.mockResolvedValue(false);
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow(
      'Directory not found',
    );
  });

  test('fails when SDK zip is missing', async () => {
    glob.sync.mockReturnValueOnce([]);
    fs.pathExists.mockResolvedValue(true);
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow('AEM SDK file');
  });

  test('warns when forms zip missing during full install', async () => {
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
    const warn = jest.spyOn(Setup.prototype, 'warn');
    await Setup.run([], ROOT_OPTS);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('AEM Forms addons ZIP file'),
    );
  });

  test('aborts when forms zip missing and user declines', async () => {
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
      question: jest
        .fn()
        .mockResolvedValueOnce('no')
        .mockResolvedValueOnce('yes')
        .mockResolvedValueOnce('no')
        .mockResolvedValueOnce('no')
        .mockResolvedValue('no'),
      close: jest.fn(),
    });
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow('AEM Forms addons');
  });

  test('continues when forms zip missing and user agrees', async () => {
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
      question: jest
        .fn()
        .mockResolvedValueOnce('no') // full install
        .mockResolvedValueOnce('yes') // forms
        .mockResolvedValueOnce('no') // secrets
        .mockResolvedValueOnce('no') // dispatcher
        .mockResolvedValue('yes'), // continue on missing forms
      close: jest.fn(),
    });
    await Setup.run([], ROOT_OPTS);
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
    expect(fs.remove).toHaveBeenCalledWith(path.join(process.cwd(), 'aem-sdk'));
  });

  test('aborts when secrets install fails', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce([])
      .mockReturnValueOnce(['aem-forms-addon.zip']);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest
        .fn()
        .mockResolvedValueOnce('no')
        .mockResolvedValueOnce('yes')
        .mockResolvedValueOnce('yes')
        .mockResolvedValue('no'),
      close: jest.fn(),
    });
    const { installSecrets } = require('../src/lib/secrets');
    installSecrets.mockRejectedValue(new Error('fail'));
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow('fail');
  });

  test('continues when secrets install fails and user agrees', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce([])
      .mockReturnValueOnce(['aem-forms-addon.zip']);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest
        .fn()
        .mockResolvedValueOnce('no') // full install
        .mockResolvedValueOnce('no') // forms
        .mockResolvedValueOnce('yes') // secrets
        .mockResolvedValueOnce('no') // dispatcher
        .mockResolvedValue('yes'), // continue on failure
      close: jest.fn(),
    });
    const { installSecrets } = require('../src/lib/secrets');
    installSecrets.mockRejectedValue('bad');
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

  test('aborts when dispatcher install fails', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce([]);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest
        .fn()
        .mockResolvedValueOnce('no') // full install
        .mockResolvedValueOnce('no') // forms
        .mockResolvedValueOnce('yes') // secrets
        .mockResolvedValueOnce('yes') // dispatcher
        .mockResolvedValueOnce('') // dispatcher src
        .mockResolvedValue('no'), // continue on failure
      close: jest.fn(),
    });
    const { installDispatcher } = require('../src/lib/dispatcher');
    installDispatcher.mockRejectedValue(new Error('dispfail'));
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow('dispfail');
  });

  test('continues when dispatcher install fails and user agrees', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce([]);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest
        .fn()
        .mockResolvedValueOnce('no') // full install
        .mockResolvedValueOnce('no') // forms
        .mockResolvedValueOnce('no') // secrets
        .mockResolvedValueOnce('yes') // dispatcher
        .mockResolvedValueOnce('') // dispatcher src
        .mockResolvedValue('yes'), // continue on failure
      close: jest.fn(),
    });
    const { installDispatcher } = require('../src/lib/dispatcher');
    installDispatcher.mockRejectedValue('bad');
    await Setup.run([], ROOT_OPTS);
  });

  test('warns when secrets install fails during full install', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce([])
      .mockReturnValueOnce(['aem-forms-addon.zip']);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest.fn().mockResolvedValue('yes'),
      close: jest.fn(),
    });
    const warn = jest.spyOn(Setup.prototype, 'warn');
    const { installSecrets } = require('../src/lib/secrets');
    installSecrets.mockRejectedValue(new Error('oops'));
    await Setup.run([], ROOT_OPTS);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Skipping secrets installation'),
    );
  });

  test('warns when dispatcher install fails during full install', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce([])
      .mockReturnValueOnce(['aem-forms-addon.zip']);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest.fn().mockResolvedValue('yes'),
      close: jest.fn(),
    });
    const warn = jest.spyOn(Setup.prototype, 'warn');
    const { installDispatcher } = require('../src/lib/dispatcher');
    installDispatcher.mockRejectedValue(new Error('oops'));
    await Setup.run([], ROOT_OPTS);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Skipping AEM Dispatcher installation'),
    );
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

  test('fails when helper scripts cannot be copied', async () => {
    glob.sync
      .mockReturnValueOnce(['aem-sdk.zip'])
      .mockReturnValueOnce(['quickstart.jar'])
      .mockReturnValueOnce([])
      .mockReturnValueOnce(['aem-forms-addon.zip']);
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    const readline = require('node:readline/promises');
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: jest.fn().mockResolvedValue('yes'),
      close: jest.fn(),
    });
    const { copyStartScripts } = require('../src/lib/scripts');
    copyStartScripts.mockRejectedValue('boom');
    await expect(Setup.run([], ROOT_OPTS)).rejects.toThrow('boom');
  });
});
