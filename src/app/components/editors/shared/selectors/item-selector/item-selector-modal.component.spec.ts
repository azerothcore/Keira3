import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';

import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { QueryService } from '../../../../../services/query.service';
import { MockedQueryService } from '../../../../../test-utils/mocks';
import { CommonTestModule } from '../../../../../test-utils/common-test.module';

describe('ItemSelectorModalComponent', () => {
  let component: ItemSelectorModalComponent;
  let fixture: ComponentFixture<ItemSelectorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSelectorModalComponent ],
      imports: [
        CommonTestModule,
        NgxDatatableModule,
      ],
      providers: [
        BsModalRef,
        { provide: QueryService, useValue: instance(MockedQueryService) },
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
