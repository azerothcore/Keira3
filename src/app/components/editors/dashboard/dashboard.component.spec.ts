import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { anyString, instance, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { QueryService } from '../../../services/query.service';
import { MockedQueryService } from '../../../test-utils/mocks';
import { VersionDbRow, VersionRow } from '../../../types/general';
import { PageObject } from '../../../test-utils/page-object';
import { DashboardModule } from './dashboard.module';

class DashboardComponentPage extends PageObject<DashboardComponent> {
  get coreVersion() { return this.query<HTMLTableCellElement>('#core-version'); }
  get coreRevision() { return this.query<HTMLTableCellElement>('#core-revision'); }
  get dbVersion() { return this.query<HTMLTableCellElement>('#db-version'); }
  get dbWorldVersion() { return this.query<HTMLTableCellElement>('#db-world-version'); }
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let page: DashboardComponentPage;

  const versionRow: VersionRow = {
    core_version: 'AzerothCore rev. 2bcedc2859e7 2019-02-17 10:04:09 +0100 (master branch) (Unix, Debug)',
    core_revision: '2bcedc2859e7',
    db_version: 'ACDB 335.3 (dev)',
    cache_id: 3,
  };
  const worldDbVersion = '2019_02_17_02';
  const versionDbRow: VersionDbRow = {
    'sql_rev': 123,
    'required_rev': null,
    [worldDbVersion]: null,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ DashboardModule ],
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
    page = new DashboardComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should correctly display the ', () => {
    expect(page.coreVersion.innerHTML).toContain(versionRow.core_version);
    expect(page.coreRevision.innerHTML).toContain(versionRow.core_revision);
    expect(page.dbVersion.innerHTML).toContain(versionRow.db_version);
    expect(page.dbWorldVersion.innerHTML).toContain(worldDbVersion);
  });

  it('should correctly give error if the query does not return the data in the expected format', () => {
    when(MockedQueryService.query(anyString())).thenReturn(of({ results: [] }));
    const errorSpy = spyOn(console, 'error');

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it('should correctly give error if the query returns an error', () => {
    const error = 'some error';
    when(MockedQueryService.query(anyString())).thenReturn(throwError(error));
    const errorSpy = spyOn(console, 'error');

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledWith(error);
  });
});
