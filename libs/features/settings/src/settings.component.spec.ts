import { TestBed } from '@angular/core/testing';
import { ElectronService, ServerSettingsService } from '@keira/shared/common-services';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { WOW_DATA_SETTINGS_KEY, WowClientService } from '@keira/shared/wow-data';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { SettingsComponent } from './settings.component';

describe(SettingsComponent.name, () => {
  it('edits the game data folders, and says they were saved', async () => {
    localStorage.setItem(WOW_DATA_SETTINGS_KEY, JSON.stringify({ clientPath: '/wow', serverDataPath: '' }));
    const toastr = { success: vi.fn(), error: vi.fn() };
    const client = { close: vi.fn().mockResolvedValue(undefined) };
    TestBed.configureTestingModule({
      imports: [SettingsComponent, TranslateTestingModule],
      providers: [
        { provide: ToastrService, useValue: toastr },
        { provide: WowClientService, useValue: client },
        { provide: ClipboardService, useValue: { copyFromContent: vi.fn() } },
        { provide: ElectronService, useValue: { isElectron: () => false } },
      ],
    });
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    // (never locked here)
    expect(el.querySelector('[data-testid="folders-modify"]')).toBeNull();
    const source = el.querySelector<HTMLInputElement>('[data-testid="source-path"]') as HTMLInputElement;
    source.value = '/ac';
    source.dispatchEvent(new Event('input'));
    el.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(JSON.parse(localStorage.getItem(WOW_DATA_SETTINGS_KEY) as string).sourcePath).toBe('/ac');
    expect(client.close).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalledWith('SETTINGS.SAVED');
  });

  it('picks, imports, copies and removes themes', async () => {
    localStorage.clear();
    window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn() })) as never;
    const toastr = { success: vi.fn(), error: vi.fn() };
    const clipboard = { copyFromContent: vi.fn() };
    TestBed.configureTestingModule({
      imports: [SettingsComponent, TranslateTestingModule],
      providers: [
        { provide: ToastrService, useValue: toastr },
        { provide: WowClientService, useValue: { close: vi.fn() } },
        { provide: ClipboardService, useValue: clipboard },
        { provide: ElectronService, useValue: { isElectron: () => false } },
      ],
    });
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const query = <T extends HTMLElement>(id: string) => el.querySelector<T>(`[data-testid="${id}"]`) as T;
    const select = query<HTMLSelectElement>('theme-select');
    select.value = 'dark';
    select.dispatchEvent(new Event('change'));
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    // a built-in theme copies a template
    query('theme-copy').click();
    expect(JSON.parse(clipboard.copyFromContent.mock.calls[0][0]).name).toBe('My theme');
    // a broken theme says why; a good one is picked
    const json = query<HTMLTextAreaElement>('theme-json');
    json.value = '{"name":"Night"}';
    json.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    query('theme-import').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(query('theme-error').textContent).toContain('"base"');
    json.value = '{"name":"Night","base":"dark","colors":{"--keira-accent":"#e67e22"}}';
    json.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    query('theme-import').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(toastr.success).toHaveBeenCalledWith('SETTINGS.THEME_IMPORTED');
    expect(query<HTMLSelectElement>('theme-select').value).toBe('Night');
    // from a file
    const file = query<HTMLInputElement>('theme-file');
    Object.defineProperty(file, 'files', {
      configurable: true,
      value: [new File(['{"name":"Dawn","base":"light","colors":{}}'], 'dawn.json')],
    });
    file.dispatchEvent(new Event('change'));
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    expect(query<HTMLSelectElement>('theme-select').value).toBe('Dawn');
    Object.defineProperty(file, 'files', { configurable: true, value: [] });
    file.dispatchEvent(new Event('change'));
    query('theme-remove').click();
    fixture.detectChanges();
    expect(query<HTMLSelectElement>('theme-select').value).toBe('system');
    expect(query('theme-remove')).toBeNull();
  });

  it('keeps the characters database name, when it is one', () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [SettingsComponent, TranslateTestingModule],
      providers: [
        { provide: ToastrService, useValue: { success: vi.fn() } },
        { provide: WowClientService, useValue: { close: vi.fn() } },
        { provide: ClipboardService, useValue: { copyFromContent: vi.fn() } },
        { provide: ElectronService, useValue: { isElectron: () => false } },
      ],
    });
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('[data-testid="characters-database"]') as HTMLInputElement;
    expect(input.value).toBe('acore_characters');
    input.value = 'bad name';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="characters-database-error"]')).toBeTruthy();
    input.value = ' chars ';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="characters-database-error"]')).toBeNull();
    expect(TestBed.inject(ServerSettingsService).settings().charactersDatabase).toBe('chars');
  });
});
