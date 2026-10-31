import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { WaypointDataAddon } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { WaypointHandlerService } from '../waypoint-handler.service';
import { WaypointDataAddonComponent } from './waypoint-data-addon.component';

class Page extends MultiRowEditorPageObject<WaypointDataAddonComponent> {}

describe('WaypointDataAddon integration tests', () => {
  const spline = (PointID: number, SplinePointIndex: number) =>
    Object.assign(new WaypointDataAddon(), { PathID: 1230, PointID, SplinePointIndex, PositionX: 1 });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, WaypointDataAddonComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(rows: WaypointDataAddon[]) {
    const handlerService = TestBed.inject(WaypointHandlerService);
    handlerService['_selected'] = '1230';
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(rows));
    const fixture = TestBed.createComponent(WaypointDataAddonComponent);
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { page, handlerService };
  }

  it('adds spline points after the last one of the last point, and copies after their point', () => {
    const { page, handlerService } = setup([spline(1, 0), spline(2, 0), spline(2, 1), spline(1, 1)]);
    page.addNewRow();
    page.expectDiffQueryToContain('(1230, 2, 2, 0, 0, 0)');
    expect(handlerService.isWaypointDataAddonTableUnsaved()).toBe(true);
    page.clickRowOfDatatable(0);
    page.duplicateSelectedRow();
    page.expectDiffQueryToContain('(1230, 1, 2, 1, 0, 0)');
  });

  it('starts a path without spline points at point 1, index 0', () => {
    const { page } = setup([]);
    page.addNewRow();
    page.expectDiffQueryToContain('(1230, 1, 0, 0, 0, 0)');
  });
});
