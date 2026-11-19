import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ElectronService } from '@keira/shared/common-services';
import { MysqlService } from '@keira/shared/db-layer';
import { EventEmitter } from 'events';
import { WPP_FOLDER_KEY, WppService } from './wpp.service';

/** A program run: what it prints, how it ends. */
interface FakeRun {
  out?: string[];
  err?: string[];
  code?: number | null;
  error?: string;
  throws?: boolean;
}

describe('WppService', () => {
  const setup = (runs: Record<string, FakeRun> = {}, files: Record<string, string> = {}, electron = true) => {
    localStorage.clear();
    const spawn = vi.fn((command: string, args: string[]) => {
      const run = runs[`${command} ${args[0]}`] ?? { code: 0 };
      if (run.throws) {
        throw new Error('spawn failed');
      }
      const child = new EventEmitter() as EventEmitter & { stdout: EventEmitter; stderr: EventEmitter };
      child.stdout = new EventEmitter();
      child.stderr = new EventEmitter();
      setTimeout(() => {
        run.out?.forEach((line) => child.stdout.emit('data', Buffer.from(`${line}\n`)));
        run.err?.forEach((line) => child.stderr.emit('data', `${line}\r\n`));
        if (run.error) {
          child.emit('error', new Error(run.error));
        } else {
          child.emit('close', run.code === undefined ? 0 : run.code);
        }
      });
      return child;
    });
    const dirs: Record<string, string[]> = {};
    for (const path of Object.keys(files)) {
      const dir = path.slice(0, path.lastIndexOf('/'));
      dirs[dir] = [...(dirs[dir] ?? []), path.slice(path.lastIndexOf('/') + 1)];
    }
    const written: Record<string, string> = {};
    const fs = {
      existsSync: (path: string) => path in files || path in dirs || Object.keys(dirs).some((dir) => dir.startsWith(`${path}/`)),
      readdirSync: (path: string) => [
        ...new Set([
          ...(dirs[path] ?? []),
          ...Object.keys(dirs)
            .filter((d) => d.startsWith(`${path}/`))
            .map((d) => d.slice(path.length + 1).split('/')[0]),
        ]),
      ],
      readFileSync: (path: string) => files[path],
      writeFileSync: (path: string, text: string) => (written[path] = text),
      unlinkSync: vi.fn((path: string) => {
        if (!(path in written)) {
          throw new Error('ENOENT');
        }
        delete written[path];
      }),
      statSync: (path: string) => ({ mtimeMs: path.endsWith('.pkt') ? 0 : Date.now() + 1000 }),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ElectronService, useValue: { isElectron: () => electron, childProcess: { spawn }, fs } },
        {
          provide: MysqlService,
          useValue: { config: { host: 'db', port: 3307, user: 'acore', password: 'pw', database: 'acore_world' } },
        },
      ],
    });
    return { service: TestBed.inject(WppService), spawn, written, fs };
  };

  afterEach(() => localStorage.clear());

  it('keeps its folder, and runs only in the desktop app', () => {
    const { service } = setup();
    expect(service.isSupported()).toBe(true);
    expect(service.folder()).toBe('');
    service.setFolder(' C:/wpp ');
    expect(service.folder()).toBe('C:/wpp');
    expect(localStorage.getItem(WPP_FOLDER_KEY)).toBe('C:/wpp');
    TestBed.resetTestingModule();
    expect(setup({}, {}, false).service.isSupported()).toBe(false);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    TestBed.inject(WppService).setFolder('x');
    setItem.mockRestore();
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    TestBed.resetTestingModule();
    expect(setup().service.folder()).toBe('');
    getItem.mockRestore();
  });

  it('runs a program, telling each line it prints, and how it ended', async () => {
    const { service } = setup({
      'git --version': { out: ['git version 2.45', ''], err: ['warning'] },
      'dotnet --version': { code: null },
      'bad x': { error: 'not found' },
      'worse x': { throws: true },
    });
    const lines: string[] = [];
    expect(await service.tools((line) => lines.push(line))).toEqual({ git: true, dotnet: false });
    expect(lines).toEqual(['git version 2.45', 'warning']);
    expect(await service.run('bad', ['x'], undefined, () => undefined)).toEqual({ code: -1, output: 'not found' });
    expect(await service.run('worse', ['x'], undefined, () => undefined)).toEqual({ code: -1, output: 'spawn failed' });
    expect((await service.tools()).git).toBe(true);
  });

  it('downloads WPP (or updates it), builds it and finds it built', async () => {
    const { service, spawn } = setup({}, { '/wpp/WowPacketParser/bin/Release/net10.0/WowPacketParser.dll': '' });
    expect(service.builtDll()).toBeUndefined();
    service.setFolder('/new');
    await service.download(() => undefined);
    expect(spawn).toHaveBeenLastCalledWith('git', ['clone', '--depth', '1', 'https://github.com/TrinityCore/WowPacketParser.git', '/new'], {
      cwd: undefined,
      shell: false,
      windowsHide: true,
    });
    expect(service.builtDll()).toBeUndefined();

    TestBed.resetTestingModule();
    const built = setup(
      {},
      {
        '/wpp/.git/HEAD': '',
        '/wpp/WowPacketParser/bin/Release/net10.0/WowPacketParser.dll': '',
        '/wpp/WowPacketParser/bin/Release/net9.0/WowPacketParser.dll': '',
        '/wpp/WowPacketParser/bin/Release/x/other': '',
      },
    );
    built.service.setFolder('/wpp');
    await built.service.download(() => undefined);
    expect(built.spawn).toHaveBeenLastCalledWith('git', ['pull', '--ff-only'], expect.objectContaining({ cwd: '/wpp' }));
    await built.service.build(() => undefined);
    expect(built.spawn).toHaveBeenLastCalledWith(
      'dotnet',
      ['build', 'WowPacketParser.slnx', '-c', 'Release'],
      expect.objectContaining({ cwd: '/wpp' }),
    );
    // the newest .NET build
    expect(built.service.builtDll()).toBe('/wpp/WowPacketParser/bin/Release/net10.0/WowPacketParser.dll');

    TestBed.resetTestingModule();
    const unbuilt = setup({}, { '/wpp/WowPacketParser/bin/Release/x/other': '' });
    unbuilt.service.setFolder('/wpp');
    expect(unbuilt.service.builtDll()).toBeUndefined();
  });

  it("parses a sniff with Keira's config, telling the files it wrote", async () => {
    const dir = '/wpp/WowPacketParser/bin/Release/net10.0';
    const { service, spawn, written, fs } = setup(
      {},
      {
        [`${dir}/WowPacketParser.dll`]: '',
        'C:\\s\\b.pkt': '',
        [`${dir}/WowPacketParser.dll.config`]: '<appSettings>\n<add key="DBEnabled" value="false" />\n</appSettings>',
        '/sniffs/My.pkt': '',
        '/sniffs/My_parsed.txt': '',
      },
    );
    expect((await service.parse('/sniffs/My.pkt', undefined, () => undefined)).output).toBe('WowPacketParser is not built');
    service.setFolder('/wpp');

    const lines: string[] = [];
    expect((await service.parse('My.pkt', undefined, (line) => lines.push(line))).code).toBe(-1);
    expect((await service.parse('/sniffs/None.pkt', undefined, () => undefined)).output).toBe('No sniff at /sniffs/None.pkt (give its full path)');
    expect(lines).toEqual(['No sniff at My.pkt (give its full path)']);
    expect(spawn).not.toHaveBeenCalled();

    let config = '';
    spawn.mockImplementationOnce(((command: string, args: string[]) => {
      config = written[args[2]];
      return spawn.getMockImplementation()!(command, args);
    }) as never);
    const result = await service.parse('/sniffs/My.pkt', service.database('acore_wpp_keira'), () => undefined);

    expect(config).toContain('<add key="DBEnabled" value="true" />');
    expect(config).toContain('value="acore_world"');
    // the config (with the password) is taken away after the run
    expect(written[`${dir}/keira.config`]).toBeUndefined();
    expect(spawn).toHaveBeenLastCalledWith(
      'dotnet',
      [`${dir}/WowPacketParser.dll`, '--ConfigFile', `${dir}/keira.config`, '/sniffs/My.pkt'],
      expect.objectContaining({ cwd: dir }),
    );
    expect(result.files).toEqual(['/sniffs/My_parsed.txt']);
    // a config already gone is fine
    fs.unlinkSync.mockImplementationOnce(() => {
      throw new Error('ENOENT');
    });
    expect((await service.parse('/sniffs/My.pkt', undefined, () => undefined)).code).toBe(0);
    expect((await service.parse('C:\\s\\b.pkt', undefined, () => undefined)).files).toEqual([]);
    expect(service.database('x')).toEqual({
      host: 'db',
      port: 3307,
      user: 'acore',
      password: 'pw',
      wppDatabase: 'x',
      worldDatabase: 'acore_world',
    });
  });

  it('gives defaults for a login without host, port or database', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ElectronService, useValue: { isElectron: () => false } },
        { provide: MysqlService, useValue: { config: {} } },
      ],
    });
    expect(TestBed.inject(WppService).database('s')).toEqual({
      host: 'localhost',
      port: 3306,
      user: '',
      password: '',
      wppDatabase: 's',
      worldDatabase: '',
    });
  });
});
