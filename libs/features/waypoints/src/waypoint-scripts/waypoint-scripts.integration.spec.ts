import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { WaypointScripts } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { WaypointHandlerService } from '../waypoint-handler.service';
import { WaypointScriptsHandlerService } from '../waypoint-scripts-handler.service';
import { WaypointScriptsComponent } from './waypoint-scripts.component';

class Page extends MultiRowEditorPageObject<WaypointScriptsComponent> {}

describe('WaypointScripts integration tests', () => {
  const id = 50;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, WaypointScriptsComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(usedAt: unknown, max: unknown = [{ max: 900 }]) {
    const handlerService = TestBed.inject(WaypointScriptsHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'query').mockImplementation(((sql: string) =>
      /FROM waypoint_data/.test(sql)
        ? usedAt instanceof Error
          ? throwError(() => usedAt)
          : of(usedAt)
        : /MAX\(guid\)/.test(sql)
          ? of(max)
          : of([])) as never);
    const step = Object.assign(new WaypointScripts(), { id, guid: 3, command: 1, delay: 2 });
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of([step]));
    const fixture = TestBed.createComponent(WaypointScriptsComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { page, handlerService };
  }

  it('gives new steps guids above the highest in use, names commands, and lists the points running it', () => {
    const { page } = setup([{ id: 1230, point: 4 }]);
    expect(page.getDatatableCell(0, 3).innerText).toBe('EMOTE');
    page.addNewRow();
    page.expectDiffQueryToContain('(50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 901)');
    page.setInputValueById('command', 99);
    expect(page.getDatatableCell(1, 3).innerText).toBe('99');
    const paths = vi.spyOn(TestBed.inject(WaypointHandlerService), 'select').mockImplementation(() => undefined);
    page.clickElement(page.query('#open-path-1230-4'));
    expect(paths).toHaveBeenCalledWith(false, 1230, '1230');
  });

  it('is used nowhere when none or when that can not be read; an empty table starts guids at 1', () => {
    const { page } = setup(new Error('no table'), []);
    expect(page.query('#not-used')).toBeTruthy();
    page.addNewRow();
    page.expectDiffQueryToContain(', 1)');
  });

  it('takes no rows from the database as used nowhere', () => {
    const { page } = setup(undefined);
    expect(page.query('#not-used')).toBeTruthy();
  });
});
