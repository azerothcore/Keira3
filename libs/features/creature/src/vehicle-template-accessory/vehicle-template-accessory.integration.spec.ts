import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { VehicleTemplateAccessory } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { VehicleTemplateAccessoryComponent } from './vehicle-template-accessory.component';

class VehicleTemplateAccessoryPage extends MultiRowEditorPageObject<VehicleTemplateAccessoryComponent> {}

describe('VehicleTemplateAccessory integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, VehicleTemplateAccessoryComponent],
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

  const setup = (creatingNew: boolean) => {
    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = '1234';
    handlerService.isNew = creatingNew;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    const existing = Object.assign(new VehicleTemplateAccessory(), { entry: 1234, seat_id: 7 });
    const selectAll = vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [existing]));
    const page = new VehicleTemplateAccessoryPage(TestBed.createComponent(VehicleTemplateAccessoryComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, selectAll, handlerService };
  };

  it('reads the rows', () => {
    const { page, selectAll } = setup(false);

    expect(selectAll).toHaveBeenCalledWith('vehicle_template_accessory', 'entry', '1234');
    expect(page.getEditorTableRowsCount()).toBe(1);
    expect(page.query('#editor-help')).toBeTruthy();
  });

  it('adds a row, then executes the query', () => {
    const { page, querySpy, handlerService } = setup(true);
    querySpy.mockClear();

    page.addNewRow();
    expect(handlerService.isVehicleTemplateAccessoryUnsaved()).toBe(true);
    page.setInputValueById('f-seat-id', 55);

    const expected =
      'DELETE FROM `vehicle_template_accessory` WHERE (`entry` = 1234) AND (`seat_id` IN (55));\n' +
      'INSERT INTO `vehicle_template_accessory` (`entry`, `seat_id`, `accessory_entry`, `minion`, `description`, `summontype`, `summontimer`) VALUES\n' +
      "(1234, 55, 0, 0, '', 6, 30000);";
    page.expectDiffQueryToContain(expected);
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain(expected);
  });
});
