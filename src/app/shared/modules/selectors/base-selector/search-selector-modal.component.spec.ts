import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { instance } from 'ts-mockito';

import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { SearchService } from '../../search/search.service';
import { ItemTemplate } from '@keira-types/item-template.type';
import { ItemSearchService } from '../../search/item-search.service';
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
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(ItemSearchService);
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
