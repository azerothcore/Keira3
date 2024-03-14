import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { FactionSelectorModalComponent } from './faction-selector-modal.component';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { FactionSearchService } from '../../search/faction-search.service';
import { MockedMysqlQueryService, MockedSqliteService } from '../../../services/services.mock';
import { SqliteService } from '../../../services/sqlite.service';

describe('FactionSelectorModalComponent', () => {
  let component: FactionSelectorModalComponent;
  let fixture: ComponentFixture<FactionSelectorModalComponent>;
  let searchService: FactionSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FactionSelectorModalComponent, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(FactionSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(FactionSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
