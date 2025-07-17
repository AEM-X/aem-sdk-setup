const fs = require('fs-extra');
const unzipper = require('unzipper');

jest.mock('fs-extra');
jest.mock('unzipper');

const { extractZip } = require('../../src/lib/extraction');

afterEach(() => jest.resetAllMocks());

test('extractZip pipes stream to unzipper', async () => {
  const stream = {
    pipe: jest.fn(() => ({ promise: jest.fn().mockResolvedValue() })),
  };
  fs.createReadStream.mockReturnValue(stream);
  unzipper.Extract.mockReturnValue('ex');
  await extractZip('test.zip', '/out');
  expect(fs.createReadStream).toHaveBeenCalledWith('test.zip');
  expect(stream.pipe).toHaveBeenCalledWith('ex');
});
