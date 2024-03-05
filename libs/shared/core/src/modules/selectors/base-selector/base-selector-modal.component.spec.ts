import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { BaseSelectorModalComponent } from './base-selector-modal.component';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { SearchService } from '../../search/search.service';
import { ItemTemplate } from '@keira/shared/acore-world-model';
import { ItemSearchService } from '../../search/item-search.service';
import { ItemSelectorModule } from '../item-selector/item-selector.module';
import Spy = jasmine.Spy;
import { MockedMysqlQueryService } from '../../../services/mocks.spec';

describe('BaseSelectorModalComponent', () => {
  let component: BaseSelectorModalComponent;
  let fixture: ComponentFixture<ItemSelectorModalComponent>;
  let searchService: SearchService<ItemTemplate>;
  let hideSpy: Spy;

  const value = 'mock-value';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemSelectorModule, TranslateTestingModule],
      providers: [BsModalRef, { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(ItemSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(ItemSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    hideSpy = spyOn(TestBed.inject(BsModalRef), 'hide');
  });

  it('onCancel() should correctly hide the modal', () => {
    component.onCancel();
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });

  it('onSave() should correctly emit the value and hide the modal', () => {
    const nextSpy = spyOn(component.onValueSelected, 'next');
    component.value = value;

    component.onSave();

    expect(nextSpy).toHaveBeenCalledWith(value);
    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });
});
