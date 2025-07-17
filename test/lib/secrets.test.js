const fs = require('fs-extra');

jest.mock('fs-extra');
jest.mock('extract-zip');
jest.mock('child_process');

const {
  installSecrets,
  hiddenPrompt,
  unzipWithPassword,
} = require('../../src/lib/secrets');

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
  const readline = require('node:readline');
  jest.spyOn(readline, 'createInterface').mockReturnValue({
    question: (q, cb) => cb('secret'),
    close: jest.fn(),
    output: { write: jest.fn() },
    stdoutMuted: true,
    _writeToOutput: jest.fn(),
  });
  await installSecrets('/out');
  expect(extract).toHaveBeenCalledTimes(2);
});

test('falls back to unzip command when passworded zip cannot be extracted', async () => {
  fs.pathExists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  const extract = require('extract-zip');
  extract
    .mockRejectedValueOnce(new Error('fail'))
    .mockRejectedValueOnce(new Error('fail'));
  const childProc = require('child_process');
  const mockOn = jest.fn((evt, cb) => evt === 'close' && cb(0));
  jest.spyOn(childProc, 'spawn').mockReturnValue({ on: mockOn });
  const readline = require('node:readline');
  jest.spyOn(readline, 'createInterface').mockReturnValue({
    question: (q, cb) => cb('secret'),
    close: jest.fn(),
    output: { write: jest.fn() },
    stdoutMuted: true,
    _writeToOutput: jest.fn(),
  });
  await installSecrets('/out');
  expect(childProc.spawn).toHaveBeenCalled();
});

test('skips copying when no secretsdir', async () => {
  fs.pathExists.mockResolvedValue(false);
  await installSecrets('/out');
  expect(fs.copy).not.toHaveBeenCalled();
});

test('hiddenPrompt masks password', async () => {
  const readline = require('node:readline');
  const mockWrite = jest.fn();
  const rl = {
    question: (q, cb) => {
      rl._writeToOutput('a');
      cb('secret');
    },
    close: jest.fn(),
    output: { write: mockWrite },
  };
  jest.spyOn(readline, 'createInterface').mockReturnValue(rl);
  const answer = await hiddenPrompt('pw: ');
  expect(answer).toBe('secret');
  expect(mockWrite).toHaveBeenCalledWith('*');
});
