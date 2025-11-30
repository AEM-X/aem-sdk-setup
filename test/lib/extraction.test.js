const fs = require('fs-extra');
const unzipper = require('unzipper');

jest.mock('fs-extra');
jest.mock('unzipper');

const { extractZip } = require('../../src/lib/extraction');

afterEach(() => {
  jest.resetAllMocks();
});

test('extracts zip file to destination', async () => {
  const mockExtract = {
    promise: jest.fn().mockResolvedValue(),
  };
  const mockStream = {
    pipe: jest.fn().mockReturnValue(mockExtract),
  };

  fs.pathExists.mockResolvedValue(true);
  fs.ensureDir.mockResolvedValue();
  fs.createReadStream.mockReturnValue(mockStream);
  unzipper.Extract.mockReturnValue(mockExtract);

  await extractZip('./test.zip', './dest');

  expect(fs.pathExists).toHaveBeenCalledWith('./test.zip');
  expect(fs.ensureDir).toHaveBeenCalledWith('./dest');
  expect(fs.createReadStream).toHaveBeenCalledWith('./test.zip');
  expect(unzipper.Extract).toHaveBeenCalledWith({ path: './dest' });
  expect(mockStream.pipe).toHaveBeenCalledWith(mockExtract);
  expect(mockExtract.promise).toHaveBeenCalled();
});

test('rejects when extraction fails', async () => {
  const mockExtract = {
    promise: jest.fn().mockRejectedValue(new Error('Extraction failed')),
  };
  const mockStream = {
    pipe: jest.fn().mockReturnValue(mockExtract),
  };

  fs.pathExists.mockResolvedValue(true);
  fs.ensureDir.mockResolvedValue();
  fs.createReadStream.mockReturnValue(mockStream);
  unzipper.Extract.mockReturnValue(mockExtract);

  await expect(extractZip('./test.zip', './dest')).rejects.toThrow(
    'Extraction failed',
  );
});
