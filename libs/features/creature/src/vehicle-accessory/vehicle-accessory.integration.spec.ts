import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { VehicleAccessory } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { VehicleAccessoryComponent } from './vehicle-accessory.component';

class VehicleAccessoryPage extends MultiRowEditorPageObject<VehicleAccessoryComponent> {}

describe('VehicleAccessory integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, VehicleAccessoryComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        CreatureHandlerService,
        SaiCreatureHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = (rows: VehicleAccessory[]) => {
    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = '1234';
    handlerService.isNew = false;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of(rows));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    const page = new VehicleAccessoryPage(TestBed.createComponent(VehicleAccessoryComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, handlerService };
  };

  it("reads the accessories of the creature's spawns, two seats of one spawn told apart", () => {
    const row = (seat_id: number) => Object.assign(new VehicleAccessory(), { guid: 500, seat_id, accessory_entry: 9 });
    const { page, querySpy } = setup([row(0), row(1)]);

    expect(querySpy).toHaveBeenCalledWith(
      'SELECT a.* FROM creature AS c INNER JOIN vehicle_accessory AS a ON c.guid = a.guid WHERE c.id1 = 1234 ORDER BY a.guid, a.seat_id',
    );
    expect(page.getEditorTableRowsCount()).toBe(2);
    expect(page.query('#editor-help')).toBeTruthy();

    page.clickRowOfDatatable(0);
    page.setInputValueById('f-seat-id', 1);
    expect(page.formError.hidden).toBe(false);
  });

  it('adds an accessory to a spawn, then executes the query', () => {
    const { page, querySpy, handlerService } = setup([]);
    querySpy.mockClear();

    page.addNewRow();
    expect(handlerService.isVehicleAccessoryUnsaved()).toBe(true);
    page.setInputValueById('f-guid', 500);
    page.setInputValueById('f-seat-id', 2);

    page.expectDiffQueryToContain(
      'INSERT INTO `vehicle_accessory` (`guid`, `seat_id`, `accessory_entry`, `minion`, `description`, `summontype`, `summontimer`) VALUES\n' +
        "(500, 2, 0, 0, '', 6, 30000);",
    );
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.some(([sql]) => String(sql).startsWith('DELETE FROM `vehicle_accessory`'))).toBe(true);
  });
});
