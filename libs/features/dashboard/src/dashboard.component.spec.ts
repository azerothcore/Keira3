import { TestBed, waitForAsync } from '@angular/core/testing';
import { KeiraPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { VersionDbRow, VersionRow } from '@keira/shared/constants';
import { of, throwError } from 'rxjs';
import { anyString, instance, mock, reset, when } from 'ts-mockito';
import { DashboardComponent } from './dashboard.component';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';

class DashboardComponentPage extends KeiraPageObject<DashboardComponent> {
  get coreVersion(): HTMLTableCellElement {
    return this.query<HTMLTableCellElement>('#core-version');
  }
  get coreRevision(): HTMLTableCellElement {
    return this.query<HTMLTableCellElement>('#core-revision');
  }
  get dbVersion(): HTMLTableCellElement {
    return this.query<HTMLTableCellElement>('#db-version');
  }
  // get dbWorldVersion(): HTMLTableCellElement {
  //   return this.query<HTMLTableCellElement>('#db-world-version');
  // }
  dbWarning(assert = true): HTMLDivElement {
    return this.query<HTMLDivElement>('#database-warning', assert);
  }
  get commitHashUrl(): HTMLAnchorElement {
    return this.query<HTMLAnchorElement>('#commit-hash-url');
  }
  get reloadBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#reload-btn');
  }
}

describe('DashboardComponent', () => {
  const versionRow: VersionRow = {
    core_version: 'AzerothCore rev. 2bcedc2859e7 2019-02-17 10:04:09 +0100 (master branch) (Unix, Debug)',
    core_revision: '2bcedc2859e7',
    db_version: 'ACDB 335.3 (dev)',
    cache_id: 3,
  };
  const wrongVersionRow: VersionRow = {
    core_version: 'ShinCore rev. 2bcedc2859e7 2019-02-17 10:04:09 +0100 (master branch) (Unix, Debug)',
    core_revision: '2bcedc2859e7',
    db_version: 'SHINDB 335.3 (dev)',
    cache_id: 3,
  };
  const worldDbVersion = '2019_02_17_02';
  const versionDbRow: VersionDbRow = {
    sql_rev: 123,
    required_rev: null as any,
    [worldDbVersion]: null as any,
  };

  const MockedMysqlQueryService = mock(MysqlQueryService);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslateTestingModule],
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }).compileComponents();
  }));

  const setup = () => {
    reset(MockedMysqlQueryService);
    when(MockedMysqlQueryService.query('SELECT * FROM version')).thenReturn(of([versionRow]));
    when(MockedMysqlQueryService.query('SELECT * FROM version_db_world')).thenReturn(of([versionDbRow]));
    const mysqlService = TestBed.inject(MysqlService);
    mysqlService['_config'] = { database: 'my_db' };

    const fixture = TestBed.createComponent(DashboardComponent);
    const page = new DashboardComponentPage(fixture);
    const component = fixture.componentInstance;

    return { fixture, page, component };
  };

  it('should correctly display the versions', () => {
    const { page } = setup();
    page.detectChanges();

    expect(page.coreVersion.innerHTML).toContain(versionRow.core_version);
    expect(page.coreRevision.innerHTML).toContain(versionRow.core_revision);
    expect(page.dbVersion.innerHTML).toContain(versionRow.db_version);
    expect(page.commitHashUrl.href).toEqual(`https://github.com/azerothcore/azerothcore-wotlk/commit/${versionRow.core_revision}`);
    // expect(page.dbWorldVersion.innerHTML).toContain(worldDbVersion);
    expect(page.dbWarning(false)).toBeFalsy();
  });

  it('if the revision hash ends with a "+", it should be stripped in the url', () => {
    const { page } = setup();
    when(MockedMysqlQueryService.query('SELECT * FROM version')).thenReturn(
      of([
        {
          ...versionRow,
          core_revision: versionRow.core_revision + '+',
        },
      ]),
    );

    page.detectChanges();

    expect(page.commitHashUrl.href).toEqual(`https://github.com/azerothcore/azerothcore-wotlk/commit/${versionRow.core_revision}`);
  });

  describe('refresh button', () => {
    it('when the refresh button is clicked, it should correctly reload the data', () => {
      const { page } = setup();
      page.detectChanges();
      expect(page.coreVersion.innerHTML).toContain(versionRow.core_version);

      const newVersion = 'A new fantastic AzerothCore version!';
      when(MockedMysqlQueryService.query('SELECT * FROM version')).thenReturn(
        of([
          {
            ...versionRow,
            core_version: newVersion,
          },
        ]),
      );
      page.reloadBtn.click();
      page.detectChanges();

      expect(page.coreVersion.innerHTML).not.toContain(versionRow.core_version);
      expect(page.coreVersion.innerHTML).toContain(newVersion);
    });

    it('when clicked after an error, it should clear the error out', () => {
      const { page } = setup();

      when(MockedMysqlQueryService.query(anyString())).thenReturn(of([wrongVersionRow]));
      page.detectChanges();
      expect(page.dbWarning()).toBeDefined();

      when(MockedMysqlQueryService.query(anyString())).thenReturn(of([versionRow]));
      page.reloadBtn.click();
      page.detectChanges();

      expect(page.dbWarning(false)).toBeFalsy();
    });
  });

  it('should correctly give error if the query does not return the data in the expected format', () => {
    const { page } = setup();
    when(MockedMysqlQueryService.query(anyString())).thenReturn(of([]));
    const errorSpy = spyOn(console, 'error');

    page.detectChanges();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(page.dbWarning(false)).toBeFalsy();
  });

  it('should correctly give error if the query returns an error', () => {
    const { page } = setup();
    const error = 'some error';
    when(MockedMysqlQueryService.query(anyString())).thenReturn(throwError(error));
    const errorSpy = spyOn(console, 'error');

    page.detectChanges();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(error);
    expect(page.dbWarning()).toBeDefined();
  });

  it('should correctly give error if the query returns an error', () => {
    const { page } = setup();
    when(MockedMysqlQueryService.query(anyString())).thenReturn(of([wrongVersionRow]));

    page.detectChanges();

    expect(page.dbWarning()).toBeDefined();
  });
});
