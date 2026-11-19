import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';

import { ItemSearchService } from '../../search/item-search.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('SearchSelectorModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ItemSelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }).compileComponents();
  });

  const setup = (value?: number) => {
    const searchService = TestBed.inject(ItemSearchService);
    searchService.query = '--mock query';
    const searchExact = vi.spyOn(searchService, 'searchExact').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(ItemSelectorModalComponent);
    const component = fixture.componentInstance;
    if (value !== undefined) {
      // (as the selector button opens it: initialState.value)
      component.value = value;
    }
    fixture.detectChanges();

    return { searchService, fixture, component, searchExact };
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
    vi.spyOn(searchService, 'onSearch').mockImplementation(() => undefined);

    component.onSearch();

    expect(searchService.onSearch).toHaveBeenCalledTimes(1);
  });

  it('opened on a field already set, shows what it holds (#3245)', () => {
    const { searchExact } = setup(25);

    expect(searchExact).toHaveBeenCalledWith('entry', 25, expect.anything());
  });

  it('opened on an empty field, searches nothing', () => {
    const { searchExact } = setup(0);

    expect(searchExact).not.toHaveBeenCalled();
  });
});
