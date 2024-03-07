import { TestBed, waitForAsync } from '@angular/core/testing';

import { Spied, TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ConnectionWindowService } from '../../../connection-window/connection-window.service';
import { LogoutBtnComponent } from './logout-btn.component';
import { LocationService, ModalConfirmComponent } from '@keira/shared/core';
import Spy = jasmine.Spy;

describe('LogoutBtnComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), LogoutBtnComponent, ModalConfirmComponent, TranslateTestingModule],
      providers: [
        {
          provide: ConnectionWindowService,
          useValue: jasmine.createSpyObj('ConnectionWindowService', ['saveRememberPreference']),
        },
      ],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(LogoutBtnComponent);
    const component = fixture.componentInstance;
    const connectionWindowService = TestBed.inject(ConnectionWindowService) as unknown as Spied<ConnectionWindowService>;
    fixture.detectChanges();

    return { fixture, component, connectionWindowService };
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
    const { component, connectionWindowService } = setup();
    const locationServiceSpy: Spy = spyOn(TestBed.inject(LocationService), 'reload');

    component.logout();

    expect(locationServiceSpy).toHaveBeenCalledTimes(1);
    expect(connectionWindowService.saveRememberPreference).toHaveBeenCalledOnceWith(false);
  });

  // closeModalsAfterEach();
});
