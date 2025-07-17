const fs = require('fs-extra');

jest.mock('fs-extra');
jest.mock('extract-zip');

const { installSecrets } = require('../../src/lib/secrets');

afterEach(() => jest.resetAllMocks());

test('copies secrets when directory exists', async () => {
  fs.pathExists.mockResolvedValue(true);
  await installSecrets('/out');
  expect(fs.ensureDir).toHaveBeenCalledTimes(2);
  expect(fs.writeFile).toHaveBeenCalledTimes(2);
  expect(fs.copy).toHaveBeenCalledTimes(2);
});

test('extracts secrets zip', async () => {
  fs.pathExists
    .mockResolvedValueOnce(false) // folder
    .mockResolvedValueOnce(true); // zip
  const extract = require('extract-zip');
  await installSecrets('/out');
  expect(extract).toHaveBeenCalledWith('secretsdir.zip', {
    dir: expect.any(String),
  });
});

test('prompts password when extraction fails', async () => {
  fs.pathExists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  const extract = require('extract-zip');
  extract.mockRejectedValueOnce(new Error('fail'));
  const readline = require('node:readline/promises');
  jest.spyOn(readline, 'createInterface').mockReturnValue({
    question: jest.fn().mockResolvedValue('secret'),
    close: jest.fn(),
  });
  await installSecrets('/out');
  expect(extract).toHaveBeenCalledTimes(2);
});

test('skips copying when no secretsdir', async () => {
  fs.pathExists.mockResolvedValue(false);
  await installSecrets('/out');
  expect(fs.copy).not.toHaveBeenCalled();
});
