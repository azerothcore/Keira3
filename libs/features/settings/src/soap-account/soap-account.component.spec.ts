import { TestBed } from '@angular/core/testing';
import { ServerSettingsService } from '@keira/shared/common-services';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ClipboardService } from 'ngx-clipboard';
import { SoapAccountComponent } from './soap-account.component';
import { SoapAccountService } from './soap-account.service';

describe('SoapAccountComponent', () => {
  it('makes the account only when asked, or copies its SQL, and says how it went', async () => {
    localStorage.clear();
    const accounts = {
      create: vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied')),
      sql: vi.fn().mockResolvedValue('INSERT …'),
    };
    const clipboard = { copyFromContent: vi.fn() };
    TestBed.configureTestingModule({
      imports: [SoapAccountComponent, TranslateTestingModule],
      providers: [
        { provide: SoapAccountService, useValue: accounts },
        { provide: ClipboardService, useValue: clipboard },
      ],
    });
    const fixture = TestBed.createComponent(SoapAccountComponent);
    const created = vi.fn();
    fixture.componentInstance.created.subscribe(created);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const query = <T extends HTMLElement>(id: string) => el.querySelector<T>(`[data-testid="${id}"]`) as T;
    const settle = async () => {
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
    };
    // not asked: nothing shown
    expect(query('soap-account')).toBeNull();
    query('soap-account-wanted').click();
    fixture.detectChanges();
    expect(query<HTMLInputElement>('soap-account-name').value).toMatch(/^Keira\d{7}$/);
    const firstPassword = query<HTMLInputElement>('soap-account-password').value;
    query('soap-account-regenerate').click();
    fixture.detectChanges();
    expect(query<HTMLInputElement>('soap-account-password').value).not.toBe(firstPassword);
    const type = (id: string, value: string, event = 'input') => {
      const input = query<HTMLInputElement>(id);
      input.value = value;
      input.dispatchEvent(new Event(event));
      fixture.detectChanges();
    };
    type('soap-account-name', 'MySoap');
    type('soap-account-password', 'secret');
    type('soap-account-database', 'auth', 'change');
    type('soap-account-database', 'bad name', 'change');
    expect(TestBed.inject(ServerSettingsService).settings().authDatabase).toBe('auth');
    query('soap-account-create').click();
    await settle();
    expect(accounts.create).toHaveBeenCalledWith('MySoap', 'secret');
    expect(created).toHaveBeenCalled();
    expect(query('soap-account-answer').textContent).toContain('SETTINGS.SOAP_ACCOUNT_CREATED');
    query('soap-account-create').click();
    await settle();
    expect(query('soap-account-answer').classList).toContain('text-danger');
    expect(query('soap-account-answer').textContent).toContain('denied');
    query('soap-account-copy').click();
    await settle();
    expect(clipboard.copyFromContent).toHaveBeenCalledWith('INSERT …');
    expect(query('soap-account-answer').textContent).toContain('SETTINGS.SOAP_ACCOUNT_COPIED');
  });
});
