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

  const setup = (value?: string | number) => {
    const searchService = TestBed.inject(ItemSearchService);
    searchService.query = '--mock query';
    const onSearchSpy = vi.spyOn(searchService, 'onSearch').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(ItemSelectorModalComponent);
    const component = fixture.componentInstance;
    if (value !== undefined) {
      // set by BsModalService through initialState before the first change detection
      component.value = value;
    }
    fixture.detectChanges();

    const entryInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input#entry') as HTMLInputElement;
    const nameInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input#name') as HTMLInputElement;

    return { searchService, fixture, component, onSearchSpy, entryInput, nameInput };
  };

  it('should prefill the id field with the current value and search it on open', () => {
    const { searchService, onSearchSpy, entryInput, nameInput } = setup(1907);

    expect(entryInput.value).toEqual('1907');
    expect(nameInput.value).toEqual('');
    expect(searchService.fields.getRawValue()).toEqual({ entry: 1907, name: null });
    expect(onSearchSpy).toHaveBeenCalledTimes(1);
  });

  it('should clear the filters of a previous search when prefilling the id field', () => {
    TestBed.inject(ItemSearchService).fields.setValue({ entry: null, name: 'Sword' } as any);

    const { onSearchSpy, entryInput, nameInput } = setup(1907);

    expect(entryInput.value).toEqual('1907');
    expect(nameInput.value).toEqual('');
    expect(onSearchSpy).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, 0, -12345, ''])('should not prefill nor search when the current value is %s', (value) => {
    TestBed.inject(ItemSearchService).fields.setValue({ entry: null, name: 'Sword' } as any);

    const { onSearchSpy, entryInput, nameInput } = setup(value);

    expect(entryInput.value).toEqual('');
    expect(nameInput.value).toEqual('Sword');
    expect(onSearchSpy).not.toHaveBeenCalled();
  });

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

    component.onSearch();

    expect(searchService.onSearch).toHaveBeenCalledTimes(1);
  });
});
