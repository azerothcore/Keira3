import { CommonModule } from '@angular/common';
import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';
import { ItemSelectorBtnComponent } from '../item-selector/item-selector-btn.component';
import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { MysqlService } from '@keira/shared/db-layer';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@NgModule({
  imports: [
    ModalModule.forRoot(),
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    HighlightjsWrapperComponent,
    TranslateTestingModule,
    ItemSelectorModalComponent,
  ],
  providers: [provideZonelessChangeDetection(), provideNoopAnimations(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
})
class TestModule {}

describe('BaseSelectorBtnComponent', () => {
  const value = 'mock-value';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), TestModule, ItemSelectorBtnComponent],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(ItemSelectorBtnComponent);
    fixture.componentRef.setInput('disabled', false);
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
