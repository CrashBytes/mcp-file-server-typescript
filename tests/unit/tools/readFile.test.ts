import { readFileTool } from '../../../src/tools/readFile.js';
import { promises as fs } from 'fs';
import { FileNotFoundError } from '../../../src/utils/errors.js';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('readFileTool', () => {
  const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should read file successfully with utf-8 encoding', async () => {
      const mockContent = 'Hello, World!';
      mockReadFile.mockResolvedValue(Buffer.from(mockContent));

      const result = await readFileTool.execute({
        path: '/test/file.txt',
        encoding: 'utf-8',
      });

      expect(mockReadFile).toHaveBeenCalledWith('/test/file.txt', 'utf-8');
      expect(result.content[0].text).toBe(mockContent);
    });

    it('should throw FileNotFoundError for missing files', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockReadFile.mockRejectedValue(error);

      await expect(
        readFileTool.execute({ path: '/missing/file.txt' })
      ).rejects.toThrow(FileNotFoundError);
    });

    it('should reject invalid arguments', async () => {
      await expect(readFileTool.execute({ path: '' })).rejects.toThrow(
        'Path cannot be empty'
      );
    });

    it('should default to utf-8 encoding', async () => {
      mockReadFile.mockResolvedValue(Buffer.from('test'));

      await readFileTool.execute({ path: '/test.txt' });

      expect(mockReadFile).toHaveBeenCalledWith('/test.txt', 'utf-8');
    });
  });
});
