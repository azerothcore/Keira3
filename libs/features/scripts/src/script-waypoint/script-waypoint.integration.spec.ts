import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { ScriptWaypoint } from '@keira/shared/acore-world-model';
import { WORLD_EDITOR_LINKS } from '@keira/shared/constants';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { ScriptWaypointHandlerService } from '../script-waypoint-handler.service';
import { ScriptWaypointComponent } from './script-waypoint.component';

class Page extends MultiRowEditorPageObject<ScriptWaypointComponent> {}

describe('ScriptWaypoint integration tests', () => {
  const entry = 467;
  const point = (pointid: number) =>
    Object.assign(new ScriptWaypoint(), { entry, pointid, location_x: pointid, location_y: 2, location_z: 3 });
  const links = { openCreature: vi.fn() };

  function setup(rows: ScriptWaypoint[], creature: unknown, withLinks = true) {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, ScriptWaypointComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        ...(withLinks ? [{ provide: WORLD_EDITOR_LINKS, useValue: links }] : []),
      ],
    }).compileComponents();
    const handlerService = TestBed.inject(ScriptWaypointHandlerService);
    handlerService['_selected'] = `${entry}`;
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi
      .spyOn(queryService, 'query')
      .mockImplementation(((sql: string) =>
        /creature_template/.test(sql) ? (creature instanceof Error ? throwError(() => creature) : of(creature)) : of([])) as never);
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ScriptWaypointComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { page, querySpy, navigate, handlerService };
  }

  it('edits the points, names the creature and its script, and shows the path in the World Editor', () => {
    const { page, navigate, handlerService } = setup(
      [point(2), point(1)],
      [{ name: 'Defias Traitor', ScriptName: 'npc_defias_traitor', map: 0 }],
    );
    expect(page.query('#script-name').textContent).toBe('npc_defias_traitor');
    page.clickElement(page.query('#open-creature'));
    expect(links.openCreature).toHaveBeenCalledWith(467, 'Defias Traitor');
    page.clickElement(page.query('#show-in-3d'));
    expect(navigate).toHaveBeenLastCalledWith(['world-editor'], { queryParams: { map: 0, x: 1, y: 2, z: 3 } });
    page.addNewRow();
    page.expectDiffQueryToContain("(467, 3, 0, 0, 0, 0, '')");
    expect(handlerService.isScriptWaypointTableUnsaved()).toBe(true);
  });

  it('says when the creature is not spawned, or there is no creature, and works without the other editors', () => {
    const { page, navigate } = setup([], [{ name: 'Ghost', ScriptName: null, map: null }], false);
    expect(page.query('#not-spawned')).toBeTruthy();
    expect(page.query('#script-name').textContent).toBe('-');
    expect(page.query('#open-creature', false)).toBeFalsy();
    page.clickElement(page.query('#show-in-3d'));
    expect(navigate).toHaveBeenLastCalledWith(['world-editor'], { queryParams: { map: 0 } });
  });

  it('has no creature when it can not be read, or there is none', () => {
    const { page } = setup([], new Error('down'));
    expect(page.query('#no-creature')).toBeTruthy();
  });
});
