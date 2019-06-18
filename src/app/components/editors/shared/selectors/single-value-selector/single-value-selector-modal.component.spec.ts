import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsModalRef } from 'ngx-bootstrap';

import { SingleValueSelectorModalComponent } from './single-value-selector-modal.component';
import { CommonTestModule } from '../../../../../test-utils/common-test.module';

describe('SingleValueSelectorModalComponent', () => {
  let component: SingleValueSelectorModalComponent;
  let fixture: ComponentFixture<SingleValueSelectorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleValueSelectorModalComponent ],
      imports: [
        CommonTestModule,
        NgxDatatableModule,
      ],
      providers: [
        BsModalRef,
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleValueSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
