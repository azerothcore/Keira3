import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance } from 'ts-mockito';

import { HolidaySelectorModalComponent } from './holiday-selector-modal.component';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { HolidaySearchService } from '../../search/holiday-search.service';
import { MockedMysqlQueryService, MockedSqliteService } from '../../../services/services.mock';
import { SqliteService } from '../../../services/sqlite.service';

describe('HolidaySelectorModalComponent', () => {
  let component: HolidaySelectorModalComponent;
  let fixture: ComponentFixture<HolidaySelectorModalComponent>;
  let searchService: HolidaySearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HolidaySelectorModalComponent, TranslateTestingModule],
      providers: [
        BsModalRef,
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    searchService = TestBed.inject(HolidaySearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(HolidaySelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
