import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import Spy = jasmine.Spy;

import { DisconnectBtnComponent } from './disconnect-btn.component';
import { LocationService } from '@keira-shared/services/location.service';
import { NgModule } from '@angular/core';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { closeModalsAfterEach } from '@keira-testing/test-helpers';

@NgModule({
  declarations: [ModalConfirmComponent],
  imports: [],
})
class TestModule {}

describe('DisconnectBtnComponent', () => {
  let component: DisconnectBtnComponent;
  let fixture: ComponentFixture<DisconnectBtnComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DisconnectBtnComponent],
        imports: [ModalModule.forRoot(), TestModule],
      }).compileComponents();

      fixture = TestBed.createComponent(DisconnectBtnComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('openModalConfirm() should correctly work', () => {
    const showSpy = spyOn(TestBed.inject(BsModalService), 'show').and.callThrough();
    const disconnectSpy = spyOn(component, 'disconnect');

    component.openModalConfirm();
    expect(showSpy).toHaveBeenCalledTimes(1);

    component['modalRef'].content.onCancel();
    expect(disconnectSpy).toHaveBeenCalledTimes(0);

    component['modalRef'].content.onConfirm();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it('disconnect() should correctly work', () => {
    const locationServiceSpy: Spy = spyOn(TestBed.inject(LocationService), 'reload');
    component.disconnect();
    expect(locationServiceSpy).toHaveBeenCalledTimes(1);
  });

  closeModalsAfterEach();
});
