import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ElectronService } from '@keira/shared/common-services';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import {
  WOW_DATA_SETTINGS_KEY,
  WowClientService,
  WowDataCacheService,
  StartupLoadService,
  ModelViewerSettingService,
} from '@keira/shared/wow-data';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { GameDataFoldersComponent } from './game-data-folders.component';

@Component({
  imports: [GameDataFoldersComponent],
  template: '<keira-game-data-folders [locked]="locked()" (saved)="saves = saves + 1" />',
})
class HostComponent {
  readonly locked = signal(true);
  saves = 0;
}

describe(GameDataFoldersComponent.name, () => {
  const setup = (paths: object) => {
    localStorage.clear();
    localStorage.setItem(WOW_DATA_SETTINGS_KEY, JSON.stringify(paths));
    const mocks = {
      toastr: { error: vi.fn() },
      client: { close: vi.fn().mockResolvedValue(undefined) },
      clipboard: { copyFromContent: vi.fn() },
      electron: { isElectron: vi.fn().mockReturnValue(true), childProcess: { spawn: vi.fn().mockReturnValue({ unref: vi.fn() }) } },
    };
    TestBed.configureTestingModule({
      imports: [HostComponent, TranslateTestingModule],
      providers: [
        { provide: ToastrService, useValue: mocks.toastr },
        { provide: WowClientService, useValue: mocks.client },
        { provide: ClipboardService, useValue: mocks.clipboard },
        { provide: ElectronService, useValue: mocks.electron },
      ],
    });
    vi.spyOn(TestBed.inject(WowDataCacheService), 'root').mockReturnValue('/cache');
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const byId = <T extends HTMLElement>(id: string) => el.querySelector(`[data-testid="${id}"]`) as T;
    return { fixture, el, byId, mocks };
  };
  const submit = async (fixture: { detectChanges: () => void; whenStable: () => Promise<unknown> }, el: HTMLElement) => {
    el.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  };

  it('is greyed while locked until Modify, then saves the folders', async () => {
    const { fixture, el, byId, mocks } = setup({ clientPath: '/wow', serverDataPath: '' });
    expect(byId<HTMLInputElement>('client-path').readOnly).toBe(true);
    expect(byId('settings-save')).toBeNull();
    // (Enter in a field doesn't save while locked)
    await submit(fixture, el);
    expect(mocks.client.close).not.toHaveBeenCalled();
    byId<HTMLButtonElement>('folders-modify').click();
    fixture.detectChanges();
    expect(byId<HTMLInputElement>('client-path').readOnly).toBe(false);
    const server = byId<HTMLInputElement>('server-data-path');
    server.value = '/srv';
    server.dispatchEvent(new Event('input'));
    await submit(fixture, el);
    expect(JSON.parse(localStorage.getItem(WOW_DATA_SETTINGS_KEY) as string).serverDataPath).toBe('/srv');
    expect(mocks.client.close).toHaveBeenCalled();
    expect(fixture.componentInstance.saves).toBe(1);
    // locked again
    expect(byId('folders-modify')).toBeTruthy();
  });

  it('reads the folders asked for when Keira starts, and says how it went', () => {
    const { fixture, byId } = setup({ clientPath: '/wow', serverDataPath: '' });
    // (not the cache's folder)
    expect(byId('startup-cache-folder')).toBeNull();
    byId<HTMLInputElement>('startup-client-path').click();
    expect(TestBed.inject(StartupLoadService).chosen().client).toBe(true);
    (TestBed.inject(StartupLoadService) as unknown as { _states: { set(v: object): void } })._states.set({ client: 'failed' });
    fixture.detectChanges();
    expect(byId('startup-state-client-path').textContent).toContain('WORLD_EDITOR.STARTUP_FAILED');
    expect(byId('startup-state-client-path').classList).toContain('text-danger');
  });

  it('picks where the 3D previews come from: Wowhead or the game data', () => {
    const { fixture, byId } = setup({ clientPath: '/wow', serverDataPath: '' });
    expect(byId<HTMLInputElement>('model-viewer-wowhead').checked).toBe(true);

    byId<HTMLInputElement>('model-viewer-game-data').click();
    fixture.detectChanges();

    expect(TestBed.inject(ModelViewerSettingService).source()).toBe('game-data');
    expect(byId<HTMLInputElement>('model-viewer-game-data').checked).toBe(true);
    expect(byId('model-viewer-source').textContent).toContain('WORLD_EDITOR.MODEL_VIEWER_GAME_DATA');
  });

  it('is open to edit when no client folder is set, copies folders and opens them', () => {
    const { fixture, byId, mocks } = setup({ clientPath: '', serverDataPath: '' });
    expect(byId('folders-modify')).toBeNull();
    expect(byId<HTMLButtonElement>('source-path-copy').disabled).toBe(true);
    // the cache's folder in use when none is chosen
    expect(byId<HTMLInputElement>('cache-folder').placeholder).toBe('/cache');
    byId<HTMLButtonElement>('cache-folder-copy').click();
    expect(mocks.clipboard.copyFromContent).toHaveBeenCalledWith('/cache');
    for (const [agent, opener] of [
      ['Windows NT', 'explorer'],
      ['Macintosh', 'open'],
      ['X11; Linux', 'xdg-open'],
    ]) {
      const userAgent = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(agent);
      byId<HTMLButtonElement>('cache-folder-open').click();
      expect(mocks.electron.childProcess.spawn).toHaveBeenLastCalledWith(opener, ['/cache'], { detached: true, stdio: 'ignore' });
      userAgent.mockRestore();
    }
    mocks.electron.childProcess.spawn.mockImplementationOnce(() => {
      throw new Error('no file manager');
    });
    byId<HTMLButtonElement>('cache-folder-open').click();
    expect(mocks.toastr.error).toHaveBeenCalledWith('no file manager', 'World Editor');
    expect(byId<HTMLInputElement>('client-path').placeholder).toContain('World of Warcraft');
    fixture.componentInstance.locked.set(false);
    fixture.detectChanges();
    expect(byId('settings-save')).toBeTruthy();
    // (no cache folder outside the desktop app: nothing to copy)
    vi.mocked(TestBed.inject(WowDataCacheService).root).mockReturnValue(undefined);
    fixture.componentInstance.locked.set(true);
    fixture.detectChanges();
    expect(byId<HTMLButtonElement>('cache-folder-copy').disabled).toBe(true);
  });
});
