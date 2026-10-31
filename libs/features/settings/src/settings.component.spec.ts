import { TestBed } from '@angular/core/testing';
import { ElectronService } from '@keira/shared/common-services';
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
});
