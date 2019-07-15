import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';

import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { QueryService } from '../../../../../services/query.service';
import { MockedQueryService } from '../../../../../test-utils/mocks';
import { ItemSearchService } from '../../../../../services/search/item-search.service';
import { ItemSelectorModule } from './item-selector.module';

describe('ItemSelectorModalComponent', () => {
  let component: ItemSelectorModalComponent;
  let fixture: ComponentFixture<ItemSelectorModalComponent>;
  let searchService: ItemSearchService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ItemSelectorModule ],
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
