import { TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/shared/test-utils';

import { ItemSearchService } from '../../search/item-search.service';

describe('SearchSelectorModalComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemSelectorModalComponent, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) }],
    }).compileComponents();
  }));

  const setup = () => {
    const searchService = TestBed.inject(ItemSearchService);
    searchService.query = '--mock query';

    const fixture = TestBed.createComponent(ItemSelectorModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { searchService, fixture, component };
  };

  it('onSelect() should correctly work', () => {
    const { component } = setup();
    const field = 'myField';
    const value = 'mock-value';
    component['entityIdField'] = field;

    component.onSelect({ selected: [{ [field]: value }] });

    expect(component.value).toEqual(value);
  });

  it('onSearch() should call searchService.onSearch()', () => {
    const { searchService, component } = setup();
    spyOn(searchService, 'onSearch');

    component.onSearch();

    expect(searchService.onSearch).toHaveBeenCalledTimes(1);
  });
});
