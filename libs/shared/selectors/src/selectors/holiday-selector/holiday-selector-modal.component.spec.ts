import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { HolidaySelectorModalComponent } from './holiday-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { HolidaySearchService } from '../../search/holiday-search.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('HolidaySelectorModalComponent', () => {
  let component: HolidaySelectorModalComponent;
  let fixture: ComponentFixture<HolidaySelectorModalComponent>;
  let searchService: HolidaySearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HolidaySelectorModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        BsModalRef,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
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
