import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { BaseSelectorModalComponent } from './base-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { ItemTemplate } from '@keira/shared/acore-world-model';
import { ItemSearchService } from '../../search/item-search.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('BaseSelectorModalComponent', () => {
  const value = 'mock-value';

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

  function setup() {
    const searchService: SearchService<ItemTemplate> = TestBed.inject(ItemSearchService);
    searchService.query = '--mock query';

    const fixture = TestBed.createComponent(ItemSelectorModalComponent);
    const component: BaseSelectorModalComponent = fixture.componentInstance;
    fixture.detectChanges();

    const hideSpy = spyOn(TestBed.inject(BsModalRef), 'hide');

    return { fixture, component, hideSpy };
  }

  it('onCancel() should correctly hide the modal', () => {
    const { component, hideSpy } = setup();
    component.onCancel();
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });

  it('onSave() should correctly emit the value and hide the modal', () => {
    const { component, hideSpy } = setup();
    const nextSpy = spyOn(component.onValueSelected, 'next');
    component.value = value;

    component.onSave();

    expect(nextSpy).toHaveBeenCalledWith(value);
    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });
});
