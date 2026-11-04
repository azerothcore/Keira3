import { vi } from 'vitest';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ElectronService } from '@keira/shared/common-services';
import { SniffDbService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { SniffsComponent } from './sniffs.component';
import { WppService } from './wpp.service';

class SniffsPage extends PageObject<SniffsComponent> {
  el<T extends HTMLElement>(selector: string, assert = true): T {
    return this.query<T>(selector, assert);
  }
  text(selector: string): string {
    return this.el(selector).textContent ?? '';
  }
  async type(selector: string, value: string): Promise<void> {
    const input = this.el<HTMLInputElement>(selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await this.settle();
  }
  async click(selector: string): Promise<void> {
    this.el(selector).click();
    await this.settle();
  }
  async settle(): Promise<void> {
    for (let i = 0; i < 4; i++) {
      await new Promise((resolve) => setTimeout(resolve));
    }
    this.fixture.detectChanges();
  }
}

describe(SniffsComponent.name, () => {
  const setup = async (options: { electron?: boolean; exists?: boolean; built?: string } = {}) => {
    const database = signal('acore_wpp_keira');
    let exists = options.exists ?? true;
    const sniffDb = {
      database,
      setDatabase: vi.fn((name: string) => /^\w+$/.test(name) && (database.set(name), true)),
      exists: vi.fn(() => Promise.resolve(exists)),
      tables: vi.fn(() => Promise.resolve([{ name: 'creature', rows: 5 }])),
      files: vi.fn(() => Promise.resolve([{ id: 1, name: 'a.sql', size: 2097152 }])),
      create: vi.fn(() => {
        exists = true;
        return Promise.resolve();
      }),
      removeFile: vi.fn(() => Promise.resolve()),
      importSql: vi.fn((name: string, _size: number, _chunks: Iterable<string>, progress?: (d: number, t: number) => void) => {
        progress?.(1, 2);
        return Promise.resolve(
          name.endsWith('old.sql')
            ? { file: name, rows: 0, tables: [], skipped: 0, alreadyLoaded: true }
            : { file: name, rows: 3, tables: ['creature'], skipped: 1 },
        );
      }),
    };
    const folder = signal('');
    const wpp = {
      folder,
      setFolder: vi.fn((f: string) => folder.set(f)),
      builtDll: vi.fn(() => options.built),
      tools: vi.fn((onLine: (line: string) => void) => {
        onLine('git version 2');
        return Promise.resolve({ git: true, dotnet: true });
      }),
      download: vi.fn((onLine: (line: string) => void) => {
        onLine('Cloning…');
        return Promise.resolve({ code: 0, output: '' });
      }),
      build: vi.fn((onLine: (line: string) => void) => {
        onLine('Build succeeded.');
        return Promise.resolve({ code: 0, output: '' });
      }),
      database: vi.fn((name: string) => ({ host: 'h', port: 1, user: 'u', password: 'p', wppDatabase: name, worldDatabase: 'w' })),
      parse: vi.fn((_pkt: string, _db: unknown, onLine: (line: string) => void) => {
        onLine('Parsing…');
        return Promise.resolve({ code: 0, output: '', files: ['/s/My_parsed.txt', '/s/My_world.sql'] });
      }),
    };
    const fs = {
      statSync: (path: string) => ({ isDirectory: () => !path.endsWith('.sql') && !path.endsWith('.txt'), size: 10 }),
      readdirSync: (path: string) => (path === '/mass' ? ['a', 'notes.txt', 'old.sql'] : ['a.sql']),
      createReadStream: vi.fn(() => ['INSERT INTO t (a) ', 'VALUES (1);']),
    };
    const openPath = vi.fn(() => Promise.resolve(''));
    TestBed.configureTestingModule({
      imports: [SniffsComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SniffDbService, useValue: sniffDb },
        { provide: WppService, useValue: wpp },
        { provide: ElectronService, useValue: { isElectron: () => options.electron ?? true, fs, openPath } },
      ],
    });
    const page = new SniffsPage(TestBed.createComponent(SniffsComponent));
    page.fixture.detectChanges();
    await page.settle();
    return { page, sniffDb, wpp, openPath, fs };
  };

  it('shows the sniff database, its tables and files, renamed or created', async () => {
    const { page, sniffDb } = await setup({ exists: false });
    expect(page.text('#sniffs-db-state')).toContain('SNIFFS.MISSING');
    expect(page.el('#sniffs-tables', false)).toBeFalsy();

    await page.click('#sniffs-db-create');
    expect(sniffDb.create).toHaveBeenCalled();
    expect(page.text('#sniffs-db-state')).toContain('SNIFFS.EXISTS');
    expect(page.text('#sniffs-tables')).toContain('creature 5');
    expect(page.text('#sniffs-files')).toContain('2.0 MB');

    await page.type('#sniffs-db-name', 'a b');
    await page.click('#sniffs-db-save');
    expect(page.text('#sniffs-error')).toContain('SNIFFS.ERROR.NAME');
    await page.type('#sniffs-db-name', 'my_sniffs');
    await page.click('#sniffs-db-save');
    expect(sniffDb.database()).toBe('my_sniffs');

    await page.click('[data-testid="remove-file-1"]');
    expect(sniffDb.removeFile).toHaveBeenCalledWith(1);
    await page.click('#sniffs-refresh');
  });

  it('loads the sniff SQL of a folder, its subfolders too, a file already loaded skipped', async () => {
    const { page, sniffDb, fs } = await setup();
    expect(page.el<HTMLButtonElement>('#sniffs-load-btn').disabled).toBe(true);
    await page.type('#sniffs-sql-path', '/mass');
    await page.click('#sniffs-load-btn');

    expect(sniffDb.importSql.mock.calls.map(([name]) => name)).toEqual(['/mass/a/a.sql', '/mass/old.sql']);
    expect(page.text('[data-testid="result-0"]')).toContain('SNIFFS.LOADED');
    expect(page.text('[data-testid="result-1"]')).toContain('SNIFFS.ALREADY_LOADED');
    expect(page.el('#sniffs-progress', false)).toBeFalsy();

    await page.type('#sniffs-sql-path', '/one/x.sql');
    await page.click('#sniffs-load-btn');
    expect(sniffDb.importSql).toHaveBeenLastCalledWith('/one/x.sql', 10, ['INSERT INTO t (a) ', 'VALUES (1);'], expect.any(Function));
    // read a piece at a time, never whole
    expect(fs.createReadStream).toHaveBeenLastCalledWith('/one/x.sql', { encoding: 'utf8', highWaterMark: 1 << 20 });
    (page.fixture.componentInstance as unknown as { load: (path: string) => Promise<void> }).load('');
  });

  it('stays busy until all its work is done, with the progress of a file', async () => {
    const { page, sniffDb } = await setup();
    let finish: () => void = () => undefined;
    sniffDb.importSql.mockImplementationOnce(((_: string, __: number, ___: unknown, progress: (d: number, t: number) => void) => {
      progress(5, 10);
      return new Promise((resolve) => (finish = () => resolve({ file: 'x', rows: 0, tables: [], skipped: 0 })));
    }) as never);
    await page.type('#sniffs-sql-path', '/one/x.sql');
    void page.click('#sniffs-load-btn');
    await new Promise((resolve) => setTimeout(resolve));
    page.fixture.detectChanges();
    expect(page.text('#sniffs-progress')).toBe('1/1 x.sql: 50%');
    expect(page.el<HTMLButtonElement>('#sniffs-db-save').disabled).toBe(true);
    expect(page.el<HTMLButtonElement>('#sniffs-refresh').disabled).toBe(true);
    finish();
    await new Promise((resolve) => setTimeout(resolve));
    await page.fixture.whenStable();
    page.fixture.detectChanges();
    expect(page.el<HTMLButtonElement>('#sniffs-db-save').disabled).toBe(false);
  });

  it('shows the errors of the database', async () => {
    const { page, sniffDb } = await setup();
    sniffDb.exists.mockImplementation(() => Promise.reject({ sqlMessage: 'Access denied' }));
    await page.click('#sniffs-refresh');
    expect(page.text('#sniffs-error')).toContain('Access denied');
    sniffDb.exists.mockImplementation(() => Promise.reject(new Error('down')));
    await page.click('#sniffs-refresh');
    expect(page.text('#sniffs-error')).toContain('down');
    sniffDb.exists.mockImplementation(() => Promise.reject('gone'));
    await page.click('#sniffs-refresh');
    expect(page.text('#sniffs-error')).toContain('gone');
    sniffDb.exists.mockImplementation(() => Promise.resolve(true));
    sniffDb.files.mockImplementation(() => Promise.reject(new Error('no table')));
    await page.click('#sniffs-refresh');
    expect(page.el('#sniffs-files', false)).toBeFalsy();
  });

  it('downloads and builds WowPacketParser, then parses a sniff with it, its outputs opened or loaded', async () => {
    const { page, wpp, sniffDb, openPath } = await setup();
    expect(page.text('#sniffs-wpp-state')).toContain('SNIFFS.WPP_NOT_BUILT');
    await page.type('#sniffs-wpp-folder', 'C:/wpp');
    wpp.builtDll.mockReturnValue('C:/wpp/WowPacketParser.dll' as never);
    await page.click('#sniffs-wpp-build');
    expect(wpp.setFolder).toHaveBeenCalledWith('C:/wpp');
    expect(page.text('#sniffs-log')).toContain('Build succeeded.');
    expect(page.text('#sniffs-wpp-state')).toContain('SNIFFS.WPP_BUILT');

    await page.type('#sniffs-pkt', 'C:/s/My.pkt');
    const check = page.el<HTMLInputElement>('#sniffs-wpp-db');
    check.checked = true;
    check.dispatchEvent(new Event('change'));
    await page.click('#sniffs-parse');
    expect(wpp.parse).toHaveBeenCalledWith(
      'C:/s/My.pkt',
      expect.objectContaining({ wppDatabase: 'acore_wpp_keira' }),
      expect.any(Function),
    );
    expect(page.text('#sniffs-log')).toContain('Parsing…');
    expect(page.el('[data-testid="load-parsed-0"]', false)).toBeFalsy();
    await page.click('[data-testid="open-0"]');
    expect(openPath).toHaveBeenCalledWith('/s/My_parsed.txt');
    await page.click('[data-testid="load-parsed-1"]');
    expect(sniffDb.importSql).toHaveBeenLastCalledWith('/s/My_world.sql', 10, expect.anything(), expect.any(Function));

    check.checked = false;
    check.dispatchEvent(new Event('change'));
    wpp.parse.mockImplementation(() => Promise.resolve({ code: 1, output: '', files: [] }));
    await page.click('#sniffs-parse');
    expect(wpp.parse).toHaveBeenLastCalledWith('C:/s/My.pkt', undefined, expect.any(Function));
    expect(page.text('#sniffs-error')).toContain('SNIFFS.ERROR.PARSE_FAILED');
  });

  it('says why WowPacketParser could not be downloaded or built', async () => {
    const { page, wpp } = await setup();
    await page.type('#sniffs-wpp-folder', 'C:/wpp');
    for (const [tools, error] of [
      [{ git: false, dotnet: true }, 'NO_GIT'],
      [{ git: true, dotnet: false }, 'NO_DOTNET'],
    ] as const) {
      wpp.tools.mockImplementationOnce(() => Promise.resolve(tools));
      await page.click('#sniffs-wpp-build');
      expect(page.text('#sniffs-error')).toContain(`SNIFFS.ERROR.${error}`);
    }
    wpp.download.mockImplementationOnce(() => Promise.resolve({ code: 128, output: '' }));
    await page.click('#sniffs-wpp-build');
    expect(page.text('#sniffs-error')).toContain('SNIFFS.ERROR.DOWNLOAD_FAILED');
    wpp.build.mockImplementationOnce(() => Promise.resolve({ code: 1, output: '' }));
    await page.click('#sniffs-wpp-build');
    expect(page.text('#sniffs-error')).toContain('SNIFFS.ERROR.BUILD_FAILED');
    await page.click('#sniffs-wpp-save');
  });

  it('says it needs the desktop app', async () => {
    const { page } = await setup({ electron: false, built: 'x' });
    expect(page.el('#sniffs-desktop-only')).toBeTruthy();
    expect(page.text('#sniffs-wpp-state')).toContain('SNIFFS.WPP_NOT_BUILT');
  });
});
