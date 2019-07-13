import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BsModalService, ModalModule } from 'ngx-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { instance } from 'ts-mockito';
import { HighlightModule } from 'ngx-highlightjs';

import { BaseSelectorBtnComponent } from './base-selector-btn.component';
import { ItemSelectorBtnComponent } from '../item-selector/item-selector-btn.component';
import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { highlightOptions } from '../../../../../config/highlight.config';
import { MysqlService } from '../../../../../services/mysql.service';
import { MockedMysqlService } from '../../../../../test-utils/mocks';
import { closeModalsAfterEach } from '../../../../../test-utils/test-helpers';

@NgModule({
  declarations: [ ItemSelectorModalComponent ],
  entryComponents: [ ItemSelectorModalComponent ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    HighlightModule.forRoot(highlightOptions),
  ],
  providers: [
    { provide : MysqlService, useValue: instance(MockedMysqlService) },
  ]
})
class TestModule {}

describe('BaseSelectorBtnComponent', () => {
  let component: BaseSelectorBtnComponent;
  let fixture: ComponentFixture<BaseSelectorBtnComponent>;

  const value = 'mock-value';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSelectorBtnComponent ],
      imports: [
        ModalModule.forRoot(),
        TestModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSelectorBtnComponent);
    component = fixture.componentInstance;
    component.control = new FormControl();
    fixture.detectChanges();
  });

  it('onClick() should create a modal that correctly reacts to changes', () => {
    const showSpy = spyOn(TestBed.get(BsModalService), 'show').and.callThrough();

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

  closeModalsAfterEach();
});
