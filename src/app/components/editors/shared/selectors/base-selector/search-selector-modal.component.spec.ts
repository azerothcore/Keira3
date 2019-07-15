import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';

import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { QueryService } from '../../../../../services/query.service';
import { MockedQueryService } from '../../../../../test-utils/mocks';
import { SearchService } from '../../../../../services/search/search.service';
import { ItemTemplate } from '../../../../../types/item-template.type';
import { ItemSearchService } from '../../../../../services/search/item-search.service';
import { SearchSelectorModalComponent } from './search-selector-modal.component';
import { ItemSelectorModule } from '../item-selector/item-selector.module';

describe('SearchSelectorModalComponent', () => {
  let component: SearchSelectorModalComponent;
  let fixture: ComponentFixture<ItemSelectorModalComponent>;
  let searchService: SearchService<ItemTemplate>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ItemSelectorModule,
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

  it('onSelect() should correctly work', () => {
    const field = 'myField';
    const value = 'mock-value';
    component['entityIdField'] = field;

    component.onSelect({ selected: [{ [field]: value }]});

    expect(component.value).toEqual(value);
  });
});
