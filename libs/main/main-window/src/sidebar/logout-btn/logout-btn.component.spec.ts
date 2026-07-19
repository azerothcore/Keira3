import { vi, type MockInstance } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { Spied, TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { LogoutBtnComponent } from './logout-btn.component';
import { LoginConfigService } from '@keira/shared/login-config';
import { ModalConfirmComponent } from '@keira/shared/base-editor-components';
import { LocationService } from '@keira/shared/common-services';

describe('LogoutBtnComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule, LogoutBtnComponent, ModalConfirmComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        {
          provide: LoginConfigService,
          useValue: { saveRememberPreference: vi.fn() },
        },
      ],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(LogoutBtnComponent);
    const component = fixture.componentInstance;
    const loginConfigService = TestBed.inject(LoginConfigService) as unknown as Spied<LoginConfigService>;
    fixture.detectChanges();

    return { fixture, component, loginConfigService };
  }

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

  it('logout() should correctly work', () => {
    const { component, loginConfigService } = setup();
    const locationServiceSpy: MockInstance = vi.spyOn(TestBed.inject(LocationService), 'reload').mockImplementation(() => undefined);

    component.logout();

    expect(locationServiceSpy).toHaveBeenCalledTimes(1);
    expect(loginConfigService.saveRememberPreference).toHaveBeenCalledExactlyOnceWith(false);
  });

  // closeModalsAfterEach();
});
