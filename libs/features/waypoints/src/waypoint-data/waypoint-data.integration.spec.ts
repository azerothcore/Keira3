import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { WaypointData } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { WaypointHandlerService } from '../waypoint-handler.service';
import { WaypointScriptsHandlerService } from '../waypoint-scripts-handler.service';
import { WaypointDataComponent } from './waypoint-data.component';

class Page extends MultiRowEditorPageObject<WaypointDataComponent> {}

describe('WaypointData integration tests', () => {
  const id = 1230;
  const point = (n: number, extra: Partial<WaypointData> = {}): WaypointData =>
    Object.assign(new WaypointData(), { id, point: n, position_x: n * 10, position_y: 5, position_z: 1, ...extra });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, WaypointDataComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(rows: WaypointData[], walkers: unknown = [], isNew = false, columns: unknown = []) {
    const handlerService = TestBed.inject(WaypointHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = isNew;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi
      .spyOn(queryService, 'query')
      .mockImplementation(((sql: string) =>
        /creature_addon/.test(sql)
          ? walkers instanceof Error
            ? throwError(() => walkers)
            : of(walkers)
          : /SHOW COLUMNS/.test(sql)
            ? columns instanceof Error
              ? throwError(() => columns)
              : of(columns)
            : of([])) as never);
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(WaypointDataComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { page, querySpy, navigate, handlerService };
  }

  it('edits the points of a path, new ones from point 1, and names their move types', () => {
    const { page, handlerService } = setup([], [], true);
    page.addNewRow();
    page.expectDiffQueryToContain('INSERT INTO `waypoint_data`');
    // (orientation NULL: the creature keeps the way it walked in)
    page.expectDiffQueryToContain('(1230, 1, 0, 0, 0, NULL, 0, 0, 0, 0, 0, 100, 0)');
    expect(page.getDatatableCell(0, 5).innerText).toBe('NULL');
    expect(handlerService.isWaypointDataTableUnsaved()).toBe(true);
    page.setInputValueById('move_type', 9);
    expect(page.getDatatableCell(0, 7).innerText).toBe('9');
    page.setInputValueById('move_type', 1);
    expect(page.getDatatableCell(0, 7).innerText).toBe('RUN');
  });

  it('lists the creatures walking the path and shows the path in the World Editor', () => {
    const walker = { guid: 7, entry: 299, name: 'Guard', map: 1, x: '1', y: '2', z: '3' };
    const { page, navigate, querySpy } = setup([point(2), point(1, { action: 5 })], [walker]);
    expect(querySpy.mock.calls.find(([sql]) => /creature_addon/.test(sql))?.[0]).toContain('a.path_id = 1230');
    expect(page.query<HTMLElement>('#walkers').innerText).toContain('Guard');
    page.clickElement(page.query('#show-in-3d'));
    expect(navigate).toHaveBeenLastCalledWith(['world-editor'], {
      queryParams: { map: 1, x: 10, y: 5, z: 1, select: 'path:1230#1' },
    });
    page.clickElement(page.query('#show-walker-7'));
    expect(navigate).toHaveBeenLastCalledWith(['world-editor'], {
      queryParams: { map: 1, x: 1, y: 2, z: 3, select: 'path:1230#1' },
    });
    // a point's action, in the Waypoint Scripts editor
    page.clickRowOfDatatable(1);
    const scripts = vi.spyOn(TestBed.inject(WaypointScriptsHandlerService), 'select').mockImplementation(() => undefined);
    page.clickElement(page.query('#edit-action'));
    expect(scripts).toHaveBeenCalledWith(false, 5, '5');
  });

  it('has no walkers when none or when they can not be read; an empty path shows map 0', () => {
    const { page, navigate } = setup([], new Error('no table'));
    expect(page.query('#no-walkers')).toBeTruthy();
    page.clickElement(page.query('#show-in-3d'));
    expect(navigate).toHaveBeenLastCalledWith(['world-editor'], { queryParams: { map: 0 } });
  });

  it("leaves out the columns an older database doesn't have", () => {
    const columns = [
      'id',
      'point',
      'position_x',
      'position_y',
      'position_z',
      'orientation',
      'delay',
      'move_type',
      'action',
      'action_chance',
      'wpguid',
    ];
    const { page } = setup(
      [point(1)],
      [],
      false,
      columns.map((Field) => ({ Field })),
    );
    page.expectFullQueryToContain(
      '(`id`, `point`, `position_x`, `position_y`, `position_z`, `orientation`, `delay`, `move_type`, `action`, `action_chance`, `wpguid`)',
    );
    page.addNewRow();
    page.expectDiffQueryToContain('(1230, 2, 0, 0, 0, NULL, 0, 0, 0, 100, 0)');
    expect(page.query('#velocity', false)).toBeFalsy();
    expect(page.query('#smoothTransition', false)).toBeFalsy();
  });

  it('keeps every column when the columns can not be read', () => {
    const { page } = setup([point(1)], [], false, new Error('denied'));
    expect(page.query('#velocity')).toBeTruthy();
    page.expectFullQueryToContain('`velocity`');
  });

  it('takes no rows from the database as no walkers', () => {
    const { page } = setup([point(1)], null);
    expect(page.query('#no-walkers')).toBeTruthy();
  });
});
