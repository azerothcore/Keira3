import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { Spied, TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { LogoutBtnComponent } from './logout-btn.component';
import { LoginConfigService, WebAuthService } from '@keira/shared/login-config';
import { ModalConfirmComponent } from '@keira/shared/base-editor-components';
import { LocationService } from '@keira/shared/common-services';
import { KEIRA_APP_CONFIG_TOKEN } from '@keira/shared/config';

describe('LogoutBtnComponent', () => {
  function setup(environment: string = 'LOCAL') {
    TestBed.configureTestingModule({
      imports: [ModalDirective, LogoutBtnComponent, ModalConfirmComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideHttpClient(),
        {
          provide: LoginConfigService,
          useValue: { saveRememberPreference: vi.fn() },
        },
        {
          provide: KEIRA_APP_CONFIG_TOKEN,
          useValue: { production: true, environment, sqlitePath: 'assets/sqlite.db' },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LogoutBtnComponent);
    const component = fixture.componentInstance;
    const loginConfigService = TestBed.inject(LoginConfigService) as unknown as Spied<LoginConfigService>;
    const webAuthService = TestBed.inject(WebAuthService);
    const locationService = TestBed.inject(LocationService);
    const reloadSpy = vi.spyOn(locationService, 'reload').mockImplementation(() => undefined);
    fixture.detectChanges();

    return { fixture, component, loginConfigService, webAuthService, locationService, reloadSpy };
  }

  it('labels the button Logout in web environments and Disconnect on desktop', () => {
    const { fixture } = setup('DOCKER');
    expect((fixture.nativeElement as HTMLElement).querySelector('button')!.textContent).toContain('SIDEBAR.LOGOUT');
  });

  it('keeps the Disconnect label on desktop', () => {
    const { fixture } = setup('LOCAL');
    expect((fixture.nativeElement as HTMLElement).querySelector('button')!.textContent).toContain('SIDEBAR.DISCONNECT');
  });

  it('openModalConfirm() should correctly work', () => {
    const { component } = setup();
    const showSpy = vi.spyOn(TestBed.inject(BsModalService), 'show');
    const logoutSpy = vi.spyOn(component, 'logout').mockImplementation(() => undefined);

    component.openModalConfirm();
    expect(showSpy).toHaveBeenCalledTimes(1);

    component['modalRef'].content.onCancel();
    expect(logoutSpy).toHaveBeenCalledTimes(0);

    component['modalRef'].content.onConfirm();
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it('logout() should correctly work (desktop environment)', () => {
    const { component, loginConfigService, reloadSpy } = setup('LOCAL');

    component.logout();

    expect(reloadSpy).toHaveBeenCalledTimes(1);
    expect(loginConfigService.saveRememberPreference).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('calls the auth logout endpoint before reloading in web environments', () => {
    const { component, webAuthService, reloadSpy } = setup('DOCKER');
    const logoutSpy = vi.spyOn(webAuthService, 'logout').mockReturnValue(of({ success: true }));

    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('just reloads in desktop environments', () => {
    const { component, webAuthService, reloadSpy } = setup('LOCAL');
    const logoutSpy = vi.spyOn(webAuthService, 'logout');

    component.logout();

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
  });

  // closeModalsAfterEach();
});
