import { NgModule } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { LocationService } from '@keira-shared/services/location.service';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { LogoutBtnComponent } from './logout-btn.component';
import Spy = jasmine.Spy;

@NgModule({
  declarations: [ModalConfirmComponent],
  imports: [],
})
class TestModule {}

describe('LogoutBtnComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LogoutBtnComponent],
      imports: [ModalModule.forRoot(), TestModule, TranslateTestingModule],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(LogoutBtnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
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
    const { component } = setup();
    const locationServiceSpy: Spy = spyOn(TestBed.inject(LocationService), 'reload');
    component.logout();
    expect(locationServiceSpy).toHaveBeenCalledTimes(1);
  });

  // closeModalsAfterEach();
});
