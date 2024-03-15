import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { ItemLimitCategorySelectorModalComponent } from './item-limit-category-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ItemLimitCategorySearchService } from '../../search/item-limit-category-search.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('ItemLimitCategorySelectorModalComponent', () => {
  let component: ItemLimitCategorySelectorModalComponent;
  let fixture: ComponentFixture<ItemLimitCategorySelectorModalComponent>;
  let searchService: ItemLimitCategorySearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemLimitCategorySelectorModalComponent, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
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
