import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { ItemLimitCategorySelectorModalComponent } from './item-limit-category-selector-modal.component';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ItemLimitCategorySearchService } from '../../search/item-limit-category-search.service';
import { ItemLimitCategorySelectorModule } from './item-limit-category-selector.module';
import { MockedMysqlQueryService, MockedSqliteService } from '../../../services/services.mock';
import { SqliteService } from '@keira/shared/core';

describe('ItemLimitCategorySelectorModalComponent', () => {
  let component: ItemLimitCategorySelectorModalComponent;
  let fixture: ComponentFixture<ItemLimitCategorySelectorModalComponent>;
  let searchService: ItemLimitCategorySearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemLimitCategorySelectorModule, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(ItemLimitCategorySearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(ItemLimitCategorySelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
