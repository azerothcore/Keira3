import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MockedMysqlService } from '@keira-testing/mocks';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';
import { MysqlService } from '../../../services/mysql.service';
import { ItemSelectorBtnComponent } from '../item-selector/item-selector-btn.component';
import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { BaseSelectorBtnComponent } from './base-selector-btn.component';

@NgModule({
  declarations: [ItemSelectorModalComponent],
  imports: [ModalModule.forRoot(), CommonModule, BrowserModule, FormsModule, ReactiveFormsModule, NgxDatatableModule],
  providers: [{ provide: MysqlService, useValue: instance(MockedMysqlService) }],
})
class TestModule {}

describe('BaseSelectorBtnComponent', () => {
  let component: BaseSelectorBtnComponent;
  let fixture: ComponentFixture<BaseSelectorBtnComponent>;

  const value = 'mock-value';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ItemSelectorBtnComponent],
      imports: [ModalModule.forRoot(), ModalModule.forRoot(), TestModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSelectorBtnComponent);
    component = fixture.componentInstance;
    component.control = new UntypedFormControl();
    fixture.detectChanges();
  });

  it('onClick() should create a modal that correctly reacts to changes', () => {
    const showSpy = spyOn(TestBed.inject(BsModalService), 'show').and.callThrough();

    component.onClick();

    expect(showSpy).toHaveBeenCalledTimes(1);

    const markAsDirtySpy = spyOn(component.control, 'markAsDirty');
    const setValueSpy = spyOn(component.control, 'setValue');

    component['modalRef'].content.value = value;
    component['modalRef'].content.onSave();

    expect(markAsDirtySpy).toHaveBeenCalledTimes(1);
    expect(setValueSpy).toHaveBeenCalledTimes(1);
    expect(setValueSpy).toHaveBeenCalledWith(value);
  });

  // closeModalsAfterEach();
});
