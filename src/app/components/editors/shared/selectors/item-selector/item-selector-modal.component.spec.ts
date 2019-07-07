import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';
import { HighlightModule } from 'ngx-highlightjs';

import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { QueryService } from '../../../../../services/query.service';
import { MockedQueryService } from '../../../../../test-utils/mocks';
import { CommonTestModule } from '../../../../../test-utils/common-test.module';
import { highlightOptions } from '../../../../../config/highlight.config';
import { ItemSearchService } from '../../../../../services/search/item-search.service';

describe('ItemSelectorModalComponent', () => {
  let component: ItemSelectorModalComponent;
  let fixture: ComponentFixture<ItemSelectorModalComponent>;
  let searchService: ItemSearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSelectorModalComponent ],
      imports: [
        CommonTestModule,
        NgxDatatableModule,
        HighlightModule.forRoot(highlightOptions),
      ],
      providers: [
        BsModalRef,
        { provide: QueryService, useValue: instance(MockedQueryService) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.get(ItemSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(ItemSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
