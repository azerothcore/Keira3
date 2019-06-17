import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClipboardModule } from 'ngx-clipboard';
import { instance, when } from 'ts-mockito';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { QueryService } from '../../../services/query.service';
import { MockedQueryService } from '../../../test-utils/mocks';
import { VersionDbRow, VersionRow } from '../../../types';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const versionRow: VersionRow = {
    core_version: 'AzerothCore rev. 2bcedc2859e7 2019-02-17 10:04:09 +0100 (master branch) (Unix, Debug)',
    core_revision: '2bcedc2859e7',
    db_version: 'ACDB 335.3 (dev)',
    cache_id: 3,
  };
  const versionDbRow: VersionDbRow = {
    sql_rev: 123,
    required_rev: null,
    2019_02_17_02: null,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent ],
      imports: [
        ClipboardModule
      ],
      providers: [
        { provide: QueryService, useValue: instance(MockedQueryService) },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    when(MockedQueryService.query('SELECT * FROM version')).thenReturn(of({ results: [versionRow] }));
    when(MockedQueryService.query('SELECT * FROM version_db_world')).thenReturn(of({ results: [versionDbRow] }));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
