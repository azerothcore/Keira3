import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { SaiWaypoints } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { SaiWaypointsHandlerService } from '../sai-waypoints-handler.service';
import { SaiWaypointsComponent } from './sai-waypoints.component';

class Page extends MultiRowEditorPageObject<SaiWaypointsComponent> {}

describe('SaiWaypoints integration tests', () => {
  const entry = 500;
  const point = (pointid: number) =>
    Object.assign(new SaiWaypoints(), { entry, pointid, position_x: pointid, position_y: 2, position_z: 3 });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, SaiWaypointsComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(rows: SaiWaypoints[], users: unknown) {
    const handlerService = TestBed.inject(SaiWaypointsHandlerService);
    handlerService['_selected'] = `${entry}`;
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi
      .spyOn(queryService, 'query')
      .mockImplementation(((sql: string) =>
        /smart_scripts/.test(sql) ? (users instanceof Error ? throwError(() => users) : of(users)) : of([])) as never);
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const sai = vi.spyOn(TestBed.inject(SaiHandlerService), 'selectFromEntity').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(SaiWaypointsComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { page, querySpy, navigate, sai, handlerService };
  }

  it('edits the points from point 1, lists the scripts starting the path and shows it in the World Editor', () => {
    const users = [
      { entryorguid: 299, source_type: 0, name: 'Guard', map: null },
      { entryorguid: -42, source_type: 0, name: '', map: 1 },
    ];
    const { page, querySpy, navigate, sai, handlerService } = setup([point(2), point(1)], users);
    expect(querySpy.mock.calls.find(([sql]) => /smart_scripts/.test(sql))?.[0]).toContain('s.action_type = 53 AND s.action_param2 = 500');
    expect(page.query<HTMLElement>('#sai-users').innerText).toContain('Guard');
    page.clickElement(page.query('#open-sai-299'));
    expect(sai).toHaveBeenCalledWith(0, 299);
    page.clickElement(page.query('#show-in-3d'));
    expect(navigate).toHaveBeenLastCalledWith(['world-editor'], {
      queryParams: { map: 1, x: 1, y: 2, z: 3, select: 'path:-500#1' },
    });
    page.addNewRow();
    page.expectDiffQueryToContain('INSERT INTO `waypoints`');
    page.expectDiffQueryToContain("(500, 3, 0, 0, 0, NULL, 0, '')");
    expect(handlerService.isSaiWaypointsTableUnsaved()).toBe(true);
  });

  it('has no scripts when none or they can not be read; an empty path shows map 0', () => {
    const { page, navigate } = setup([], new Error('no table'));
    expect(page.query('#no-sai-users')).toBeTruthy();
    page.clickElement(page.query('#show-in-3d'));
    expect(navigate).toHaveBeenLastCalledWith(['world-editor'], { queryParams: { map: 0 } });
  });

  it('takes no rows from the database as no scripts', () => {
    const { page } = setup([point(1)], null);
    expect(page.query('#no-sai-users')).toBeTruthy();
  });
});
