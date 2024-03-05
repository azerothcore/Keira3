import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';
import { MysqlService } from '../../../services/mysql.service';
import { ItemSelectorBtnComponent } from '../item-selector/item-selector-btn.component';
import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { HighlightjsWrapperModule } from '../../highlightjs-wrapper/highlightjs-wrapper.module';
import { MockedMysqlService } from '../../../services/mocks.spec';

@NgModule({
  declarations: [ItemSelectorModalComponent],
  imports: [
    ModalModule.forRoot(),
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    HighlightjsWrapperModule,
    TranslateTestingModule,
  ],
  providers: [{ provide: MysqlService, useValue: instance(MockedMysqlService) }],
})
class TestModule {}

describe('BaseSelectorBtnComponent', () => {
  const value = 'mock-value';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ItemSelectorBtnComponent],
      imports: [ModalModule.forRoot(), TestModule],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(ItemSelectorBtnComponent);
    const component = fixture.componentInstance;
    component.control = new UntypedFormControl();
    fixture.detectChanges();

    return { component };
  };

  it('onClick() should create a modal that correctly reacts to changes', () => {
    const { component } = setup();
    const showSpy = spyOn(TestBed.inject(BsModalService), 'show').and.callThrough();

    // TODO: use dom testing instead
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
