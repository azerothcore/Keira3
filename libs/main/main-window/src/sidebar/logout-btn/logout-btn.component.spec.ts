import { TestBed, waitForAsync } from '@angular/core/testing';

import { Spied, TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { LogoutBtnComponent } from './logout-btn.component';
import Spy = jasmine.Spy;
import { LoginConfigService } from '@keira/shared/login-config';
import { ModalConfirmComponent } from '@keira/shared/base-editor-components';
import { LocationService } from '@keira/shared/common-services';

describe('LogoutBtnComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), LogoutBtnComponent, ModalConfirmComponent, TranslateTestingModule],
      providers: [
        {
          provide: LoginConfigService,
          useValue: jasmine.createSpyObj('LoginConfigService', ['saveRememberPreference']),
        },
      ],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(LogoutBtnComponent);
    const component = fixture.componentInstance;
    const loginConfigService = TestBed.inject(LoginConfigService) as unknown as Spied<LoginConfigService>;
    fixture.detectChanges();

    return { fixture, component, loginConfigService };
  }

  it('openModalConfirm() should correctly work', () => {
    const { component } = setup();
    const showSpy = spyOn(TestBed.inject(BsModalService), 'show').and.callThrough();
    const logoutSpy = spyOn(component, 'logout');

    component.openModalConfirm();
    expect(showSpy).toHaveBeenCalledTimes(1);

    component['modalRef'].content.onCancel();
    expect(logoutSpy).toHaveBeenCalledTimes(0);

    component['modalRef'].content.onConfirm();
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it('logout() should correctly work', () => {
    const { component, loginConfigService } = setup();
    const locationServiceSpy: Spy = spyOn(TestBed.inject(LocationService), 'reload');

    component.logout();

    expect(locationServiceSpy).toHaveBeenCalledTimes(1);
    expect(loginConfigService.saveRememberPreference).toHaveBeenCalledOnceWith(false);
  });

  // closeModalsAfterEach();
});
