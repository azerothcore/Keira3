import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { ItemExtendedCostSelectorModalComponent } from './item-extended-cost-selector-modal.component';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ItemExtendedCostSearchService } from '../../search/item-extended-cost-search.service';
import { MockedMysqlQueryService, MockedSqliteService } from '../../../services/services.mock';
import { SqliteService } from '../../../services/sqlite.service';

describe('ItemExtendedCostSelectorModalComponent', () => {
  let component: ItemExtendedCostSelectorModalComponent;
  let fixture: ComponentFixture<ItemExtendedCostSelectorModalComponent>;
  let searchService: ItemExtendedCostSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemExtendedCostSelectorModalComponent, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(ItemExtendedCostSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(ItemExtendedCostSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
