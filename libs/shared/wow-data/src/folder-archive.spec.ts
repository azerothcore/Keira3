import { FolderArchive, normalizeArchivePath } from './folder-archive';
import { createFakeNative } from './wow-native-api.mock';

describe('FolderArchive', () => {
  const native = createFakeNative({
    '/Data/patch-y.mpq/Creature/Bear/Bear.m2': [1, 2],
    '/Data/patch-y.mpq/readme.txt': [3],
  });

  it('indexes files recursively and looks them up case-insensitively', () => {
    const archive = new FolderArchive(native, '/Data/patch-y.mpq');
    expect(archive.hasFile('creature\\bear\\BEAR.M2')).toBe(true);
    expect(archive.hasFile('missing.m2')).toBe(false);

    const file = archive.openFile('README.TXT');
    expect(Array.from(file.read())).toEqual([3]);
    file.close();
  });

  it('throws for missing files and clears on close', () => {
    const archive = new FolderArchive(native, '/Data/patch-y.mpq');
    expect(() => archive.openFile('missing')).toThrowError('File not found in folder archive: missing');
    expect(archive.hasFile('readme.txt')).toBe(true);
    archive.close();
    expect(archive.hasFile('readme.txt')).toBe(false);
  });

  it('normalizes archive paths', () => {
    expect(normalizeArchivePath('A/B\\C.TXT')).toBe('a\\b\\c.txt');
  });
});
