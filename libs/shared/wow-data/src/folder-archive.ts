import { StormArchive, StormFile, WowNativeApi } from './wow-native-api';

/**
 * A folder named like an archive (e.g. `Data/enUS/patch-enUS-y.mpq/`) whose loose files patched clients load as if it
 * were an MPQ. Lookups are case-insensitive and accept `\` separators, like MPQ paths.
 */
export class FolderArchive implements StormArchive {
  private readonly files = new Map<string, string>();

  constructor(
    private readonly native: WowNativeApi,
    root: string,
  ) {
    this.index(root, '');
  }

  private index(directory: string, prefix: string): void {
    for (const entry of this.native.readdir(directory)) {
      const fullPath = `${directory}/${entry}`;
      const relative = prefix ? `${prefix}/${entry}` : entry;
      if (this.native.isDirectory(fullPath)) {
        this.index(fullPath, relative);
      } else {
        this.files.set(normalizeArchivePath(relative), fullPath);
      }
    }
  }

  hasFile(name: string): boolean {
    return this.files.has(normalizeArchivePath(name));
  }

  openFile(name: string): StormFile {
    const fullPath = this.files.get(normalizeArchivePath(name));
    if (!fullPath) {
      throw new Error(`File not found in folder archive: ${name}`);
    }
    return { read: () => this.native.readFile(fullPath), close: () => undefined };
  }

  close(): void {
    this.files.clear();
  }
}

export function normalizeArchivePath(path: string): string {
  return path.replace(/\//g, '\\').toLowerCase();
}
