import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import Spy = jasmine.Spy;

import { LogoutBtnComponent } from './logout-btn.component';
import { LocationService } from '@keira-shared/services/location.service';
import { NgModule } from '@angular/core';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { closeModalsAfterEach } from '@keira-testing/test-helpers';

@NgModule({
  declarations: [ModalConfirmComponent],
  entryComponents: [ModalConfirmComponent],
  imports: [],
})
class TestModule { }

describe('LogoutBtnComponent', () => {
  let component: LogoutBtnComponent;
  let fixture: ComponentFixture<LogoutBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogoutBtnComponent],
      imports: [
        ModalModule.forRoot(),
        TestModule,
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(LogoutBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('openModalConfirm() should correctly work', () => {
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
    const locationServiceSpy: Spy = spyOn(TestBed.inject(LocationService), 'reload');
    component.logout();
    expect(locationServiceSpy).toHaveBeenCalledTimes(1);
  });

  closeModalsAfterEach();
});
