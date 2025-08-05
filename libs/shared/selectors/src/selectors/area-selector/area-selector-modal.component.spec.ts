import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';

import { AreaSelectorModalComponent } from './area-selector-modal.component';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { AreaSearchService } from '../../search/area-search.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

describe('AreaSelectorModalComponent', () => {
  let component: AreaSelectorModalComponent;
  let fixture: ComponentFixture<AreaSelectorModalComponent>;
  let searchService: AreaSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AreaSelectorModalComponent, TranslateTestingModule],
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
    searchService = TestBed.inject(AreaSearchService);
    searchService.query = '--mock query';

    fixture = TestBed.createComponent(AreaSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
